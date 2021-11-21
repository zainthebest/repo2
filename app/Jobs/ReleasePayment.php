<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Livewire\Exceptions\CorruptComponentPayloadException;

class ReleasePayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $payment_id = '';
    public int $payment_available_at = 0;


    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(Payment $payment)
    {
        $this->payment_id = $payment->id;
        $this->payment_available_at = $payment->available_at;

        // completed, cancelled, on_hold, disputed
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle( )
    {
        // Find payment record
        $payment = Payment::find($this->payment_id);
        info("Handle job: Payment Id: $payment->id...", $payment->toArray());

        // The job would be cancelled if the payment status changes from on_hold to disputed and then back to on_hold,
        // there would be another job dispatched for releasing this particular payment.
        if ($payment->available_at != $this->payment_available_at) return;

        // Payment's status must be "on_hold".
        if ($payment->status !== 'on_hold') return;

        // Make sure payment availability time date is not in future
        if (empty($payment->available_at)) return;

        if ($payment->available_at > now()->getTimestamp()) return;

        // Finally...
        $payment->status = 'completed';
        $payment->save();

        // Add balance to user account
        $user = User::find($payment->payee_id);
        $user->addBalance($payment->currency, $payment->amount - $payment->fee_for_payee);
        $user->minusHeldBalance($payment->currency, $payment->amount - $payment->fee_for_payee);
        Log::debug('Minus from held balance:'.$payment->currency. $payment->amount, ['ReleasePayment::handle('.$this->payment_id.')']);
    }
}
