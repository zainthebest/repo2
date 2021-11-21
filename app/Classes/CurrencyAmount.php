<?php


namespace App\Classes;


use App\Models\Currency;

class CurrencyAmount
{
    public $amount;
    public $currency;

    public function __construct($currency, $amount)
    {
        $this->currency = $currency;
        $this->amount = $amount;

        return $this;
    }

    public function convertTo($to_currency) {
        $from_currency = $this->currency;

        if ($from_currency == $to_currency) {
            return $this->amount;
        }

        // Simply converting the amount from X currency to Y currency
        $rate = Currency::find($to_currency)->rate;

        // first converting the amount to USD, suppose amount is in PKR
        $in_dollars = $this->amount / Currency::find($from_currency)->rate;
        $converted = $in_dollars * $rate;

        $decimals = 2;
        if ($to_currency === 'PKR') $decimals = 0;
        return number_format($converted, $decimals, '.', '');
    }

    
}
