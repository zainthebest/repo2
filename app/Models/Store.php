<?php

namespace App\Models;

use App\Casts\ApprovedPaymentGateways;
use App\Casts\UserAllowedPaymentGateways;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Store extends Model
{
    use HasFactory;
//    use SoftDeletes;


    protected $guarded = [];

    protected $hidden = ['secret_key'];

    protected $casts = [
        // TODO not required for now, maybe unnecessary database requests on every store model creation
        'user_allowed_pay_gateways' => UserAllowedPaymentGateways::class,
        'approved_payment_gateways' => ApprovedPaymentGateways::class
    ];

    public function invoices() {
        return $this->hasMany(Invoice::class);
    }

    // agar bitcoin address attach nhi hopata to delete invoice if it was created...
    public function generateInvoice($attributes = []) {
        $data = $attributes;

        // Converting the invoice amount from USD to BTC
        $amount_in_btc = file_get_contents('https://blockchain.info/tobtc?currency=USD&value='.$data['amount']);
        if (!is_numeric($amount_in_btc)) {
            Log::error('Amount in BTC ki value numeric nahi hy', [$amount_in_btc, $data]);
            return false;
        }
        // TODO do security check blockchain...

        $data['amount_in_btc'] = number_format($amount_in_btc, 8);
        $data['store_id'] = $this->id;
        $data['fee_payer'] = $this->fee_payer;

        // Creating an invoice with the data
        if (!$invoice = Invoice::create($data)) {
            Log::error('Error oops!', $data);
            return false;
        }


        // Attaching a token with the invoice
        // 1. Generating a random integer between 17,123,456 and 99,123,456
        // 2. Combining random int and invoice id together
        // 3. Finally, converting the base of combined integers to generate a alphanumeric token for the invoice.
        $invoice->token = strtoupper(base_convert(mt_rand(17123456,99123456).$invoice->id, 10, 36));
        // 94357855 1
        // 65197534 2
        // 95746452 3
        // 37955465 4



        // Attaching a BTC address to invoice for receiving payment
        $invoice->btc_address = $invoice->generateBTCAddress();
        if (!$invoice->btc_address) {
            Log::error('Invoice k liye Bitcoin address generate nahi ho paa raha Blockchain ki api k zariyay sy', [$invoice->btc_address, $invoice]);
            return false;
        }

        if (!$invoice->save()) {
            Log::error('Invoice k sath BTC address ya phir token nahi lag paya', $invoice);
            return false;
        }

        // Invoice generated!
        return $invoice;
    }

    public function owner() {
        return $this->belongsTo(User::class, 'user_id');
    }
//
    public function getPaymentGatewaysAttribute() {
        $user_allowed_ones = $this->user_allowed_pay_gateways;
        $pgs = array_map(function ($gateway) use ($user_allowed_ones) {
            return $this->hasApproved($gateway);
        }, array_keys($user_allowed_ones->all(), true));
        $pgs = array_filter($pgs, function ($val) { return $val; });
        return new \Illuminate\Database\Eloquent\Collection($pgs);
    }

    public function getApprovedPaymentGateways() {

        $set_payment_gateways = json_decode($this->user_allowed_pay_gateways, true);

        $approved_ones = [];
        $payment_gateways = PaymentGateway::all();

        // Preparing array of approved payment gateways ($approved_ones)
        foreach ($payment_gateways as $payment_gateway) {
            $is_set = array_key_exists($payment_gateway->name, $set_payment_gateways);
            // including ones which are NOT SET UP by the user
            // including payment gateways which are SET by the user
            if (!$is_set) {
                $approved_ones[$payment_gateway->name] = true;
            }
            if ($is_set) {
                $approved_ones[$payment_gateway->name] = $set_payment_gateways[$payment_gateway->name];
            }
        }

        $approved_ones = array_map(function ($gateway) {
            return $this->hasApproved($gateway);
        }, array_keys($approved_ones));

        // Removing items with value false.
        $approved_ones = array_filter($approved_ones, function ($v) { return $v; });

        return new \Illuminate\Database\Eloquent\Collection($approved_ones);
    }
// TODO store payment gateways config in cache

    public function getNotApprovedPaymentGateways() {
        $approved_ones = [];
        $payment_gateways = PaymentGateway::all('name')->pluck('name');

        // Simply adding ones to array that are approved by admin
        foreach ($payment_gateways as $payment_gateway) {
            if ($this->notApproved($payment_gateway)) $approved_ones[] = $this->notApproved($payment_gateway);
        }

        return new \Illuminate\Database\Eloquent\Collection($approved_ones);
    }


    public function hasApproved($gateway) {
        $pg = PaymentGateway::find($gateway);

        if ($pg->requires_approval === false || (isset($this->approved_payment_gateways[$gateway]) && $this->approved_payment_gateways[$gateway] == true)) {
            return $pg;
        }
        return false;
    }

    public function notApproved($gateway) {
        $pg = PaymentGateway::find($gateway);

        if ($pg->requires_approval === true && (!isset($this->approved_payment_gateways[$gateway]) || $this->approved_payment_gateways[$gateway] == false)) {
            return $pg;
        }
        return false;
    }

    public function acceptsPaymentVia($payment_method) {
        return $this->payment_gateways->find($payment_method);
    }
}
