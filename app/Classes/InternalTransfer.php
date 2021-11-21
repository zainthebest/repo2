<?php


namespace App\Classes;


use App\Models\Currency;
use App\Models\Payment;
use App\Models\PaymentGateway;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class InternalTransfer
{
    public $transfer_amount;
    public $currency = '';
    protected $recipient = '';
    public $description = '';

    public function __construct($transfer_amount, $currency) {
        $this->transfer_amount = $transfer_amount;
        $this->currency = $currency;
    }

    public function convertAmount($amount) {
        $currency = new CurrencyAmount('USD', $amount);
        return $currency->convertTo($this->currency);
    }

    public function getTotalFees() {
        $pg = PaymentGateway::where('name','internal_transfer')->first();
        $fees = $this->convertAmount($pg->fee_amount) +
            ($this->transfer_amount * $pg->fee_percentage / 100);
        $fees += $this->convertAmount($pg->other_data['second_fee_amount']) +
            ($this->transfer_amount * $pg->other_data['second_fee_percentage'] / 100);
        $decimals = $this->currency === 'PKR' ? 0 : 2;
        $fees = round($fees, $decimals, PHP_ROUND_HALF_UP);

        return $fees;
    }

    public function getFeeForPayer() {
        return round($this->getTotalFees() * 0.50, 2, PHP_ROUND_HALF_UP);
    }

    public function deductionAmount() {
        return $this->transfer_amount + $this->getTotalFees();
    }

    public function commit(User $recipient) {
        // Minus funds from sender account
        $user = Auth::user();
        $user->balances[$this->currency] -= $this->deductionAmount();
        if (! $user->save()) return false;

        // Add to recipient account balance
        $recipient->balances[$this->currency] += $this->transfer_amount;
        $recipient->save();

        // Saving a transaction record in the database
        return Payment::create([
            'payment_gateway' => 'internal_transfer',
            'payer_id' => $user->id,
            'payee_id' => $recipient->id,
            'currency' => $this->currency,
            'amount' => $this->transfer_amount,

            'available_at' => now()->getTimestamp(),
            'fee' => $this->deductionAmount() - $this->transfer_amount,
            'description' => "Funds transfer with description: $this->description"
        ])->id;
    }

    public function setRecipient($recipient) {
        $this->recipient = $recipient;
        return $this;
    }

    public function description($description) {
        $this->description = $description;
        return $this;
    }
}
