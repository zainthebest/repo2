<?php

namespace App\Http\Livewire\Admin;

use App\Models\Payment;
use Livewire\Component;

class ManageWithdrawals extends Component
{
    public $withdrawals;
    public $withdrawal_id;

    protected array $rules = [
        'withdrawal_id' => ''
    ];

    public function mount() {
        $this->withdrawals = Payment::where('payment_gateway', 'withdrawal')->get();
    }

    public function cancel(Payment $w) {
        $w->status = 'cancelled';
        if ($w->save()) {
            $w->payer->addBalance($w->currency, $w->amount);
            $this->emit('notification', 'Withdrawal request Cancelled!');
            $this->withdrawals = Payment::where('payment_gateway', 'withdrawal')->get();
        } else {
            $this->emit('notification', 'Oops! Something went wrong.');
        }
    }
    public function complete(Payment $w) {
        $w->status = 'completed';
        if ($w->save()) {
            $this->emit('notification', 'Withdrawal request marked as complete!');
            $this->withdrawals = Payment::where('payment_gateway', 'withdrawal')->get();
        } else {
            $this->emit('notification', 'Oops! Something went wrong.');
        }
    }

    public function render()
    {
        return view('admin.manage-withdrawals');
    }
}
