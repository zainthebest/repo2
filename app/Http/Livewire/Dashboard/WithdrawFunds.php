<?php

namespace App\Http\Livewire\Dashboard;

use App\Models\Currency;
use App\Models\Payment;
use App\Rules\Max2Decimals;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Livewire\Component;

class WithdrawFunds extends Component
{
    public $currencies = [];
    public $amount = '';
    public $bank_country = '';
    public $bank_name = '';
    public $funds_type = '';
    public $swift_code = '';
    public $ibn = '';


    public function withdraw() {
        $this->validate([
            'bank_name' => 'required|max:100', // TODO: maybe add additional validation rules
            'bank_country' => 'required|max:100', // TODO: maybe add additional validation rules
            'funds_type' => ['required', function ($attr, $val, $fail) {
                if (!$this->currencies->contains($val)) $fail('Invalid funds type');
            }],
            'amount' => ['required', new Max2Decimals(), function($attr, $val, $fail) {
                if ($val > Auth::user()->balance($this->funds_type)) $fail("You don't have enough balance to withdraw.");
            }],
            'swift_code' => 'required|max:200',
            'ibn' => 'required|max:200',
        ]);

        // Now data is submitted...

        // Minus funds from user account
        $amountToMinus = $this->amount;
        Auth::user()->balances[$this->funds_type] -= $amountToMinus;
        if (Auth::user()->save()) {
            // Generate withdraw request
            if ($created = Payment::create([
                'payment_gateway' => 'withdrawal',
                'currency' => $this->funds_type,
                'amount' => $amountToMinus,
                'status' => 'on_hold',
                'details' => [
                    'bank_name' => $this->bank_name,
                    'bank_country' => $this->bank_country,
                    'swift_code' => $this->swift_code,
                    'ibn' => $this->ibn,
                ],
                'description' => 'Withdrawal request',
                'payer_id' => \auth()->id()
            ])) {
                $this->emit('notification', 'Withdraw request has been sent!');
            } else {
                $this->emit('notification', 'Failed to send withdraw request!');
                Log::error('Withdraw failed!! User k account sy pesy minus ho gy lekin withdraw request create nhi hui.', [$this->funds_type, $amountToMinus, "UserId:".auth()->id()]);
            }

            $this->resetFields();
        } else {
            Log::error('User k account sy pesy minus nahi ho saky', [$this->funds_type, $amountToMinus]);
            $this->emit('notification', "Oops! Something went wrong, please try again later.");
        }
}

    public function resetFields() {
        $this->amount = '';
        $this->bank_country = '';
        $this->bank_name = '';
        $this->funds_type = '';
        $this->swift_code = '';
        $this->ibn = '';
    }

    public function mount() {
        $this->currencies = Currency::all()->pluck('id');
    }

    public function render()
    {
        return view('dashboard.withdraw-funds');
    }
}
