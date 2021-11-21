<?php

namespace App\Http\Livewire\Dashboard;

use App\Classes\CurrencyAmount;
use App\Classes\InternalTransfer;
use App\Http\Livewire\Snackbar;
use App\Models\Currency;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use App\Rules\Max2Decimals;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Livewire\Component;
use Livewire\Exceptions\CannotUseReservedLivewireComponentProperties;

class ConvertCurrency extends Component
{
    public $currencies = [];
    public $rates = [];
    public $amount = '';
    public $from_currency = '';
    public $to_currency = '';

    public function resetFields() {
        $this->amount = '';
        $this->from_currency = '';
        $this->to_currency = '';
    }

    public function getAmountIn($currency, $amount) {
        $a = new CurrencyAmount('USD', $amount);
        return $a->convertTo($currency);
    }

    public function convert() {
        $this->validate([
            'from_currency' => 'required|exists:currencies,id',
            'to_currency' => 'required|exists:currencies,id',
            'amount' => ['required', new Max2Decimals(), function($attr, $val, $fail) {
                if (Auth::user()->balance($this->from_currency) < $this->amount) $fail('Insufficient balance');
            } ],
        ]);
        // TODO maybe don't convert from a currency to the same currency
        //TODO if currency is btc it should validate max8decimals but max2decimals in amount

        // Converting currencies now...
        $fee_percent = Setting::find('currency_converter_fee_percent')->value;
        $amountToGive = $this->amount;
        $amountToGive = $amountToGive - round($amountToGive * $fee_percent /100, 2, PHP_ROUND_HALF_UP);
        $fee_amount = $this->amount - $amountToGive;
        $amountToGive = (new CurrencyAmount($this->from_currency, $amountToGive))->convertTo($this->to_currency);
        // TODO: maybe change upper line to change round HALF_UPs or HALF_DOWNs

        if (Auth::user()->minusBalance($this->from_currency, $this->amount)) {
            Auth::user()->addBalance($this->to_currency, $amountToGive);

            // Save currency convert record
            Payment::create([
                'payer_id' => Auth::id(),
//                'payee_id' => Auth::id(),
                'currency' => $this->from_currency,
                'amount' => $this->amount,
                'fee_for_payer' => $fee_amount,
                'available_at' => now()->getTimestamp(),
                'details' => [
                    'from_currency' => $this->from_currency,
                    'from_amount' => $this->amount,
                    'to_currency' => $this->to_currency,
                    'to_amount' => $amountToGive,
                    'fee_percent' => $fee_percent
                ],
                'description' => "Converted currency from $this->from_currency to $this->to_currency",
                'payment_gateway' => 'currency_convert'
            ]);
        }

        $this->resetFields();
        $this->emit('notification', "Converted successfully.");
    }

    public function mount() {
        $c = Currency::all(['id', 'rate']);
        $this->currencies = $c->pluck('id');
        $this->rates = json_encode($c->pluck('rate', 'id'));
    }

    public function render()
    {
        return view('dashboard.convert-currency');
    }
}
