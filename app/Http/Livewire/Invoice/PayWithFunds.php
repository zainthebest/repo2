<?php

namespace App\Http\Livewire\Invoice;

use App\Classes\InternalTransfer;
use App\Models\Currency;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Livewire\Component;

class PayWithFunds extends Component
{
    public $invoice;
    public $fees;
    public $totalAmount;

    public function mount($invoice) {
        $this->invoice = Invoice::where('token', $invoice)->firstOrFail();
        $transfer = new InternalTransfer($this->invoice->amount, $this->invoice->currency_code);
        $this->fees = $transfer->getFeeForPayer();
        $this->totalAmount = $this->invoice->amount + $this->fees;
    }

    public function confirmed() {
        // TODO maybe Invoice::paymentVia() kahin or bhee add karna hy taky koi un approved payment method sy payment kar k invoice pay na karwa saky
        $balance = Auth::user()->balance($this->invoice->currency_code);
        $currency = $this->invoice->currency_code;
        // If user's balance is less than invoice amount, return;
        if ($balance < $this->totalAmount) {
            $this->emit('notification', "Insufficient balance. You must have at least {$currency} {$this->totalAmount}");
            return;
        }
        // Checking if the invoice is already paid to avoid multiple payments
        if (Invoice::where('token', $this->invoice->token)->first()->status === 'paid') {
            $this->emit('notification', "Invoice has already been paid.");
            return;
        }
        $internal_transfer = Invoice::where('token', $this->invoice->token)->first()->paymentVia('internal_transfer');
        // Finally, deducting funds from the user's account and marking the invoice as paid
        Auth::user()->balances[$currency] -= $this->totalAmount;
        if (Auth::user()->save()) {
            // mark invoice as paid
            if ($this->invoice->hasBeenPaidVia($internal_transfer, \auth()->id())) {
                $this->emit('notification', 'Payment successful!', 'success');
                $this->redirect(route('invoice.show', $this->invoice->token));
            } else {
                Log::error('Invoice mark as paid nahi ho rahi', [$this->invoice->token, $this->invoice->status]);
                $this->emit('notification', "Oops! Something went wrong, please try again later.");
            }

        } else {
            Log::error('User k account sy pesy minus nahi ho saky', [$currency, $this->totalAmount]);
            $this->emit('notification', "Oops! Something went wrong, please try again later.");
        }
    }

    public function render()
    {
        return view('invoice.pay-with-funds');
    }
}
