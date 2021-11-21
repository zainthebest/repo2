<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $keyType = 'string';

    public static function convert($from_currency, $amount, $to_currency) {
        if ($from_currency === $to_currency) return $amount;

        // simply converting the amount from X currency to Y currency
        $rate = Currency::find($to_currency)->rate;

        // first converting the amount to USD, suppose amount is in PKR
        $in_dollars = $amount / Currency::find($from_currency)->rate;
        $converted = $in_dollars * $rate;

        $decimals = 2;
        if ($to_currency === 'PKR') $decimals = 0;
        return number_format($converted, $decimals, '.', '');
    }
}
