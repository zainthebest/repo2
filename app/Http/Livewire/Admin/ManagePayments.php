<?php

namespace App\Http\Livewire\Admin;

use App\Jobs\ReleasePayment;
use App\Models\Payment;
use Livewire\Component;

class ManagePayments extends Component
{
    public $payments;
    public $payment_id;

    protected array $rules = [
        'payment_id' => ''
    ];

    public function mount() {
        $this->reload();
    }

    public function reload() {
        $this->payments = Payment::latest()->get();
    }

    public function render()
    {
        $this->emit('notification', 'render()');
        return view('admin.manage-payments');
    }

    public function markDispute($payment_id) {
        $payment = Payment::findOrFail("$payment_id");
        if ($payment->markAsDisputed()) {
            $this->emit('notification', 'Marked as disputed payment');
        } else {
            $this->emit('notification', 'Unable to mark as disputed.');
        }
        $this->reload();
    }
//
    public function removeDispute($payment_id) {
        $payment = Payment::findOrFail("$payment_id");
        if ($payment->removeDispute()) {
            $this->emit('notification', 'Dispute is removed and payment is on hold now.');
        } else {
            $this->emit('notification', 'Unable to remove dispute.');
        }
        $this->reload();
    }
    public function markAsCancelled($payment_id) {
        $payment = Payment::findOrFail("$payment_id");
        if ($payment->markAsCancelled()) {
            $this->emit('notification', 'Payment is marked as cancelled.');
        } else {
            $this->emit('notification', 'Unable to mark as cancelled.');
        }
        $this->reload();
    }
}
