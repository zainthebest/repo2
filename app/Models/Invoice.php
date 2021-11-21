<?php

namespace App\Models;

use App\Classes\CurrencyAmount;
use App\Jobs\ReleasePayment;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Invoice extends Model
{
    use HasFactory;

    protected $guarded = [];

//    protected $keyType = 'string';
//    protected $primaryKey = 'token';
//    public $incrementing = false;

    public function markAsPaid() {
        $this->status = 'paid';
        $this->save();
    }

    public function paymentVia($payment_gateway) {
        $re = $this->store->payment_gateways->find($payment_gateway);
        if (!$re) {
            abort(401); // TODO change 401 to 405
            exit; // not allowed
        }
        return $re;
    }

    public function generateBTCAddress() {
        $blockchain = PaymentGateway::where('name', 'blockchain_btc')->first();
        $secret = $blockchain->secret_key;

        $my_xpub = $blockchain->payments_to;

        // TODO api key admin panel sy changeable honi chaahiye
        $my_api_key = '053491cc-72df-40f8-a83f-e0be4ccd15ea';


        $my_callback_url = route('api.blockchain.callback');

        $my_callback_url = $my_callback_url.'?invoice_id='.$this->id.'&secret='.$secret;

        $root_url = 'https://api.blockchain.info/v2/receive';
        // TODO change gap_limit
        $parameters = 'xpub=' .$my_xpub. '&callback=' .urlencode($my_callback_url). '&key=' .$my_api_key.'&gap_limit=100000';

        // TODO check agar kuch miss na hogya ho curl mai
        $url = $root_url . '?' . $parameters;
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HEADER, false);
        $response = curl_exec($curl);
        curl_close($curl);


        $object = json_decode($response);

        return $object->address ?? false;
    }

    public function getAmountToBePaid($payment_gateway) {
        // Getting fees for the given payment gateway
        $pg = PaymentGateway::where('name', $payment_gateway)->first();
        // TODO check karna hy kahin site per amount mai comma na aa jay badi amount mai

        $totalFeesToApply = $this->getFeeForPayer($payment_gateway);
        $amount = $this->getAmountIn('USD'); // amount in USD
        if ($payment_gateway === 'blockchain_btc') {
            $amount = $this->amount_in_btc;
        } elseif ($payment_gateway === 'alfalah' || $payment_gateway === 'jazzcash' || $payment_gateway === 'easypaisa') {
            // Getting the amount in PKR
            $amount = $this->getAmountIn('PKR');
        }
        // Adding fees to the amount
        return $totalFeesToApply + $amount;
    }

    public function getTotalFees($payment_gateway, $currency = null) {
        // TODO: Round transaction fee up always e.g. 0.014 to 0.02, Payeer sy invoice pay karo 0.01 amount dal k ya amount 0.02 ho jay gee jab k Payeer ki fee 100% nahi hai

        // Getting fees for the given payment gateway
        $pg = PaymentGateway::where('name', $payment_gateway)->first();
        $amount = $this->getAmountIn('USD');
        $decimals = 2;
        $fee = $pg->fee_amount;
        $fee_currency = 'USD';

        if ($payment_gateway === 'blockchain_btc') {
            $fee_currency = 'BTC';
            $decimals = 8;
        } else if ($payment_gateway === 'alfalah' || $payment_gateway === 'easypaisa') {
            $fee_currency = 'PKR';
            $decimals = 0;
        }
        if (!is_null($currency)) {
            $fee_currency = $currency;
        }

        $fee = new CurrencyAmount('USD', $fee);
        $fee = $fee->convertTo($fee_currency);
        $amount = $this->getAmountIn($fee_currency);

        // Adding fees to the original invoice amount
        return round($fee + (
                $amount * $pg->fee_percentage / 100
            ), $decimals, PHP_ROUND_HALF_UP);
    }

    public function getAmountIn($currency, $amountToConvert = null) {
        $amount = $this->amount;
        if (!is_null($amountToConvert)) $amount = $amountToConvert;
        $a = new CurrencyAmount($this->currency_code, $amount);
        return $a->convertTo($currency);
    }

    public function store() {
        return $this->belongsTo(Store::class);
    }
    public function storeOwner() {
        return $this->belongsTo(Store::class)->owner;
    }


    public function sendCallback() {
        // Let's send a callback to the merchant provided callback_url.
        $callback_url = $this->store->callback_url;

        $toSend = [
            'transaction_id' => $this->payment()->id,
            'store_id' => $this->store->id,
            'invoice_id' => $this->token,
            'order_id' => $this->order_id,
            'invoice_status' => $this->status,
            'invoice_currency' => $this->currency_code,
            'invoice_amount' => $this->amount,
            'invoice_description' => $this->description,
        ];
        $sha256_sign = strtoupper(hash('sha256',implode(';', [
            $toSend['transaction_id'],
            $toSend['order_id'],
            $toSend['store_id'],
            $toSend['invoice_id'],
            $toSend['invoice_status'],
            $toSend['invoice_currency'],
            $toSend['invoice_amount'],
            $toSend['invoice_description'],
            $this->store->secret_key
        ])));
        $toSend['sha256_sign'] = $sha256_sign;
        try {
            $response = Http::timeout(15)->asForm()->post($callback_url, $toSend);
            Log::info("Callback to $callback_url sent and the response + sent data is: ", [$response, $toSend]);
        } catch (\Exception $exception) {
            Log::error("Error while callback: ", [$exception->getCode(), $exception->getMessage()]);
        }
    }

    public function payment() {
        return Payment::where('reference', $this->token)->first();
    }


    public function getFeeForPayer($payment_gateway, $currency = null) {
        if ($this->fee_payer === 'payer') {
            return $this->getTotalFees($payment_gateway, $currency);
        } else if ($this->fee_payer === 'payee') {
            return 0;
        } else if ($this->fee_payer === 'both') {
            $toRound = $this->getTotalFees($payment_gateway, $currency) * 0.5;
            return round($toRound, 2, PHP_ROUND_HALF_UP);
        }

    }

    public function getFeeForPayee($payment_gateway, $currency = null) {
        if ($this->fee_payer === 'payee') {
            return $this->getTotalFees($payment_gateway, $currency);
        } else if ($this->fee_payer === 'payer') {
            return 0;
        } else if ($this->fee_payer === 'both') {
            $toRound = $this->getTotalFees($payment_gateway, $currency) * 0.5;
            return round($toRound, 2, PHP_ROUND_HALF_UP);
        }
    }

    public function hasBeenPaidVia(PaymentGateway $payment_gateway, $payer_id = null) {
        // Save a transaction record
        $payment = Payment::create([
            'payer_id' => $payer_id,
            'payee_id' => $this->store->user_id,
            'amount' => $this->amount,
//            'fee' => $this->getTotalFees($payment_gateway->name, $this->currency_code),
            'fee_for_payer' => $this->getFeeForPayer($payment_gateway->name, $this->currency_code),
            'fee_for_payee' => $this->getFeeForPayee($payment_gateway->name, $this->currency_code),
            'currency' => $this->currency_code,
            'reference' => $this->token,
            'description' => "Invoice # $this->token; $this->description",
            'payment_gateway' => $payment_gateway->name,
            'status' => 'on_hold',
            'available_at' => now()->addSeconds($payment_gateway->hold_payments_for)->getTimestamp()
        ]);

        // Add to the held balance
        // TODO maybe something is missing below line
        $amountForMerchant = ($this->amount - $this->getFeeForPayee($payment_gateway->name, $this->currency_code));
        $this->store->owner->addHeldBalance($this->currency_code, $amountForMerchant);
        Log::debug('Add to held balance Invoice::hasBeenPaidVia(): '.$this->currency_code. $amountForMerchant);
        ReleasePayment::dispatch($payment)->delay(now()->addSeconds($payment_gateway->hold_payments_for));

        // Change invoice status to paid
        $this->status = 'paid';
        $saved = $this->save();

        // Sending the store a callback
        $this->sendCallback();
        return $saved;
    }
}
