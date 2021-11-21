<?php

namespace App\Http\Livewire\Dashboard;

use App\Classes\CurrencyAmount;
use App\Classes\InternalTransfer;
use App\Http\Livewire\Snackbar;
use App\Models\Currency;
use App\Models\Payment;
use App\Models\User;
use App\Rules\Max2Decimals;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Livewire\Component;

class TransferFunds extends Component
{
    public $currencies = [];
    public $amount = '';
    public $account_id = '';
    public $funds_type = '';
    public $error_msg = null;
    // Total 3 screens - 1st for user input, 2nd for confirmation & 3rd for success message
    public $screen_no = 1;

    public $payeeName = '';
    public $amountToMinus = '';
    public $description = '';
    public $transaction_id = 0;

    public function resetFields() {
//        $this->amount = '';
//        $this->account_id = '';
//        $this->funds_type = '';
//        $this->payeeName = '';
//        $this->amountToMinus = '';
//        $this->description = '';
    }

    public function getAmountIn($currency, $amount) {
        $a = new CurrencyAmount('USD', $amount);
        return $a->convertTo($currency);
    }

    public function transfer() {
        $this->validate([
            'account_id' => 'required|int|exists:users,id',
            'funds_type' => ['required', function ($attr, $val, $fail) {
                if (!$this->currencies->contains($val)) $fail('Invalid funds type');
            }],
            'amount' => ['required', new Max2Decimals() ],
            'description' => 'nullable|max:120'
        ]);

        // now data is submitted,
        // transferring funds now...

        // - Check if account id exists
        $payee = User::findOrFail($this->account_id);

        // - check if sufficient funds are available to send in the selected currency
        $my_current_balance = Auth::user()->balance($this->funds_type);
        if ($my_current_balance < $this->amount) {
            $this->emit('notification', "You do not have enough funds in your account. Your current balance: $my_current_balance");
            return;
        }
        $transfer = new InternalTransfer($this->amount, $this->funds_type);
        // - add fees to the transfer amount
        $fees = $transfer->getTotalFees();

        $amountToMinus = $this->amount + $fees;

        if ($my_current_balance < $amountToMinus) {
            $this->emit('notification', "You do not have enough funds in your account to pay fee. Your current balance: $my_current_balance");
            return;
        }

        // - Confirm account name and the transfer amount with added fees
        $this->payeeName = $payee->name;
        $this->amountToMinus = $amountToMinus;
        $this->screen_no = 2;

        // - if users confirms continue to method $this->confirmTransfer();
    }

    public function confirmTransfer() {
        // - after confirming payee name and new amount simply save a log and transfer the funds to second account



        // minus funds from sender account
        Auth::user()->balances[$this->funds_type] -= $this->amountToMinus;
        if (Auth::user()->save()) {

            // add to payee account balance
            $payee = User::find($this->account_id);
            $payee->balances[$this->funds_type] += $this->amount;

            if ($payee->save()) {
                // Saving a transaction record in the database
                $this->transaction_id = Payment::create([
                    'payment_gateway' => 'internal_transfer',
                    'payer_id' => Auth::id(),
                    'payee_id' => $payee->id,
                    'currency' => $this->funds_type,
                    'amount' => $this->amount,
//                    'fee' => $this->amountToMinus - $this->amount,

                    'available_at' => now()->getTimestamp(),
                    'fee_for_payee' => 0,
                    'fee_for_payer' => $this->amountToMinus - $this->amount,
                    'description' => "Funds transfer with description: $this->description"
                ])->id;
                $this->screen_no = 3;

                $this->emit('notification', 'Transaction successful!');
                $this->resetFields();
            } else {
                Log::error('User k account mai pesy add nahi ho saky', [$this->funds_type, $this->amount]);
                $this->emit('notification', "Oops! Something went wrong, please try again later.");
            }
        } else {
            Log::error('User k account sy pesy minus nahi ho saky', [$this->funds_type, $this->amountToMinus]);
            $this->emit('notification', "Oops! Something went wrong, please try again later.");
        }
    // TODO what has been missed here...?
    }

    public function mount() {
        $this->currencies = Currency::all()->pluck('id');
    }

    public function render()
    {
//        new Snackbar('hello');

        return view('dashboard.transfer-funds');
    }
}
