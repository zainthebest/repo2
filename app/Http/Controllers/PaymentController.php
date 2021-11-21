<?php

namespace App\Http\Controllers;

use App\Classes\InternalTransfer;
use App\Classes\PaypalIPN;
use App\Jobs\ReleasePayment;
use App\Models\Currency;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentGateway;
use App\Models\User;
use App\Rules\Max2Decimals;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    // Invoice pay ho gi...
    // 1. mark invoice as paid
    // 2. merchant ko uss ka jo balance banta hy wo uss ka pending clearance mai add hoga
    // 3. Transaction history mai transaction record save karna hy...
    // 4. callback karni hy merchant ko callback URL per
    // 5.

    public function api_transfer_funds(Request $request) {
        // TODO what has been missed in withdraw API's security and other things?
        // api/user/transfer_funds?account_id=ACCT_ID&recipient=ACCOUNT_NO&funds_type=FUNDS_TYPE&funds_amount=AMOUNT_HERE
        $validator = Validator::make($request->all(), [
            'account_id' => 'required|int|exists:users,id',
            'recipient' => 'required|int|exists:users,id',
            'funds_type' => 'required|exists:currencies,id',
            'funds_amount' => ['required', new Max2Decimals],
            'description' => 'nullable|max:120'
        ]);
        if ($validator->fails()) {
            return new Response(['message' => $validator->errors()->first()], 400);
        }

        $user = $request->user();
        // checking if bearer token is of account_id
        // TODO what if user is authenticated by both UI and Bearer token?
        if ($user->id != $request->account_id) {
            // TODO don;t show too much details in below line
            return new Response(['message' => 'API token is not associated with the given account id.'], 400);
        }

        // Finding recipient's account
        $recipient = User::find($request->recipient);

        $transfer = (new InternalTransfer($request->funds_amount, $request->funds_type))
            ->description($request->description ?? '');

        $total_fees = $transfer->getTotalFees();
        $deduct_amount = $request->funds_amount + $total_fees;

        // Getting user's account balance
        $user_balance = $user->balance($request->funds_type);
        if ($user_balance < $deduct_amount) {
            return response()->json([
                'message' => 'Insufficient funds.'
            ]);
        }

        // TODO not required ever, is it must to provide with the user below? is $request->user() and auth()->user() not the same?
        if ($trx_id = $transfer->commit($recipient)) {
            return new JsonResponse([
                'message' => 'Transaction successful!',
                'transaction_id' => $trx_id
            ], Response::HTTP_CREATED);
        } else {
            return new JsonResponse(['message' => 'Internal error'], 500);
        }
    }

    public function alfalah_callback(Request $request) {
        Log::info('alfalah_callback(): ', $request->all() );
        if (is_null($request->url)) {
            Log::warning('Alfalah callback mai sahi details nahi receive huin ', $request->all() );
            return;
        }

        $alfalah = PaymentGateway::where('name','alfalah')->first();
        $other_data = $alfalah->other_data;
        $passphrase = $other_data['key1'];
        $iv = $other_data['key2'];
        // Encrypted URL
        $enc  = base64_decode($request->url);
        $dec = openssl_decrypt($enc, 'AES-128-CBC', $passphrase,OPENSSL_RAW_DATA, $iv);
        if (!$dec) {
            Log::warning('Alfalah error: Unable to decrypt the encrypted URL - alfalah_callback', $request->all());
            return;
        }
        // TODO: Confirm $dec is a URL
        $data = [];
        try {
            $data = file_get_contents($dec);
            $data = (object) json_decode(json_decode($data));
        } catch (Exception $exception) {
            Log::warning('alfalah_callback '.$exception->getMessage(), $request->all());
            return;
        }
//        TODO: add try () catch {} below

        // TODO: check what is missing in the whole function i.e. alfalah_callback

        $inv = Invoice::where('token', $data->TransactionReferenceNumber)->firstOrFail();
        $inv->paymentVia('alfalah');


        $toBePaid = $inv->getAmountToBePaid('alfalah');
        if ($data->TransactionAmount != $toBePaid) {
            Log::info('Alfalah info: Amount jo pay kee gi hy wo match nhi ho rahi invoice ki amount k sath', [$data->TransactionAmount, $toBePaid]);
            return;
        }

        // Verify MerchantId, StoreId, MerchantName and StoreName
        if ($data->TransactionStatus === 'Paid'
            && $data->MerchantId === $alfalah->payments_to && $data->StoreId === $other_data['store_id']
            && $data->StoreName === $other_data['store_name']
            && $data->MerchantName === $other_data['merchant_name']) {

            $inv->hasBeenPaidVia($alfalah);
            return;
        }
    }

    public function blockchain_callback(Request $request)
    {

        if ($request->secret != 'kjihih6768787nknknkn') {
            // malicious attempt
            // TODO
            return;
        }
        Log::alert('blockchain_callback(): ', $request->all() );


        $inv = Invoice::where('id', $request->invoice_id)->get();
        if (!$inv) {
            Log::alert('Malicious attempt: Invoice id jo received hui hai system mai ni hy', [$_SERVER, $request->all()]);
            return;
        }
        // if the invoice is present in the database
        $blockchain = $inv->paymentVia('blockchain_btc');
        // if the invoice is already paid
        if ($inv->status == 'paid') {
            Log::info('Information: Invoice pehly hee paid hy', $request->all());
            return '*ok*';
        }
        $toBePaid = $inv->getAmountToBePaid('blockchain_btc');
        $fee = Currency::convert('BTC', $inv->getTotalFees('blockchain_btc'), $inv->currency_code);
        if (($request->value/100000000) != $inv->getAmountToBePaid('blockchain_btc')) {
            // TODO kam amount receive hui hy dekho kya karna hy ab...
            Log::info('Less BTC amount received!', $request->all());
            return;
        }



        if ($request->confirmations >= 3) {
            $inv->hasBeenPaidVia($blockchain);
            return "*ok*";
        } else if ($request->confirmations < 3) {
            $inv->status = 'payment_detected';
            $inv->save(); // save invoice
        }

    }

    public function payeer_callback(Request $request) {
        Log::info('payeer_callback(): ', $request->all());
        // Rejecting queries from IP addresses not belonging to Payeer
        if (!in_array($_SERVER['REMOTE_ADDR'], array('185.71.65.92', '185.71.65.189',
            '149.202.17.210'))) {
            Log::alert('Payeer callback wala url open kia gya hy, or ye payeer.com ny ni kia, Payeer ka IP Address ni tha', $_SERVER);
            return;
        }

        if (isset($request->m_operation_id) && isset($request->m_sign)) {
            $invoice = Invoice::where('token', $request->m_orderid)->first();
            if (!$invoice) {
                Log::alert('Invoice not found', $request->all());
                ob_end_clean(); exit($request->m_orderid.'|error');
            }
            $payeer = $invoice->paymentVia('payeer');

            $m_key = $payeer->secret_key;
            // Forming an array for signature generation
            $arHash = array(
                $request->m_operation_id,
                $request->m_operation_ps,
                $request->m_operation_date,
                $request->m_operation_pay_date,
                $request->m_shop,
                $request->m_orderid,
                $invoice->getAmountToBePaid('payeer'),
                $request->m_curr,
                $request->m_desc,
                $request->m_status,
                $m_key
            );

            // Forming a signature
            $sign_hash = strtoupper(hash('sha256', implode(':', $arHash)));
            // If the signatures match and payment status is “Complete”
            if ($request->m_sign == $sign_hash && $request->m_status == 'success')
            {
                // Here you can mark the invoice as paid or transfer funds to your customer

                // if the invoice is already paid
                if ($invoice->status == 'paid') {
                    Log::info('Invoice pehly hee paid hy, dobara payment i hy usee invoice per', $request->all());
                    // TODO Should here be "return;"
                }

                // Mark the invoice as paid.
                $invoice->hasBeenPaidVia($payeer);

                // Returning that the payment was processed successfully
                ob_end_clean(); exit($request->m_orderid.'|success');
            } else {
                Log::alert('Malicious attempt or failed payment: hashes match ni ho rahin ya phir payeer ki successful payment ni hui', $request->all());
            }
            // If not, returning an error
            ob_end_clean(); exit($request->m_orderid.'|error');
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function perfect_money_callback(Request $request)
    {
        // Matching caller's IP address with the Perfect Money IP addresses
        if (!in_array($request->ip(), [
            '77.109.141.170',
            '91.205.41.208',
            '94.242.216.60',
            '78.41.203.75'
        ])) {
            Log::alert('Malicious attempt: Kuch galat ho raha hai. Request karny waly ka IP Ips ki list mai ni hy', $_SERVER);
            return;
        }

        $inv = Invoice::where('token', $request->PAYMENT_ID)->first();
        if (!$inv) {
            Log::alert('Malicious attempt: Invoice id jo received hui hai system mai ni hy', [$_SERVER, $request]);
            return;
        }
        // if the invoice is present in the database
        $perfect_money = $inv->paymentVia('perfect_money');
        // if the invoice is already paid
        if ($inv->status == 'paid') {
            return;
        }

        $arr = [
            $inv->token,
            $perfect_money->payments_to,
            $inv->getAmountToBePaid('perfect_money'),
            'USD', // currency
            $request->PAYMENT_BATCH_NUM, // batch
            $request->PAYER_ACCOUNT, // payer
            strtoupper(md5($perfect_money->secret_key)),
            $request->TIMESTAMPGMT, // GMT timestamp
        ];

        $hash = strtoupper(md5(implode(':', $arr)));

        // match V2_HASH with the generated hash
        if ($hash != $request->V2_HASH) {
            Log::alert('Malicious attempt: hashes match ni ho rahin', [$_SERVER, $request]);
            return;
        }
        // TODO how to check timestampgmt, what to do with this?

        // Continue if does match

        $inv->hasBeenPaidVia($perfect_money);
    }

    public function paypal_callback(Request $request) {
        // Save a log of received callback
        info('paypal_callback(): ', $request->all());
        mail('zainthebest26@gmail.com', 'paypal_callback();', json_encode($request->all(), JSON_PRETTY_PRINT));

        // Reply with an empty 200 response to indicate to paypal the IPN was received correctly
        header("HTTP/1.1 200 OK");

        $ipn = new PaypalIPN();

        // Comment below line in production
        $ipn->useSandbox();

        $verified = $ipn->verifyIPN();

        if ($verified) {
            if ($request->payment_status !== 'Completed') {
                return;
            }

            // Check if invoice exists
            $invoice = Invoice::where('token', $request->invoice)->firstOrFail();

            $paypal = PaymentGateway::find('paypal');


            // Verify receiver_email
            if ($request->receiver_email != $paypal->payments_to) {
                Log::alert("Paypal payment failed: Payment received for wrong account. Expected: $paypal->payments_to Got: $request->receiver_email.", $request->all());
                return;
            }

            // Match mc_gross, mc_currency.
            $expected_amount = $invoice->getAmountToBePaid('paypal');
            if ($request->mc_gross != $expected_amount || $request->mc_currency !== 'USD') {
                Log::info("Paypal IPN: Mismatch payment amount or currency. Expected: USD $expected_amount Received:  $request->mc_currency $request->mc_gross", $request->all());
                return;
            }

            if ($invoice->status === 'paid') {
                Log::info('Paypal IPN: Invoice is already paid.', $request->all());
            }
//
            // Mark invoice as Paid
            $invoice->hasBeenPaidVia($paypal);
        } else {
            info('Invalid paypal IPN received');
            mail('zainthebest26@gmail.com', 'Invalid Paypal IPN', 'Invalid paypal IPN received');
        }

    }

    public function show(Request $request)
    {
        $invoice_token = null;

        if (isset($request->PAYMENT_ID)) {
            $invoice_token = $request->PAYMENT_ID;
        } else if (isset($request->m_amount, $request->m_orderid)) {
            $invoice_token = $request->m_orderid;
            // TODO Do security checks
            // TODO koi bhee iska na jayz fayda na utha saky redirection system ka
        } else {
            return \request()->all();
            Log::alert('kya karna chaahiye ?', [$_SERVER]);
        }

        return redirect(route('invoice.show', $invoice_token));
    }

    public function easypaisa_callback(Request $request) {
        Log::info('Easypaisa callback: ', $request->all());
        if (isset($request->url) && parse_url($request->url)
            && parse_url($request->url)['host'] === 'easypay.easypaisa.com.pk') {
            info('oo1');
            try {
                $res = json_decode(Http::get($request->url)->body(), true);
            } catch (Exception $exception) {
                Log::error("Easypaisa callback exception. Error code ".
                    $exception->getCode()." Message: ".$exception->getMessage(), $request->all());
                return;
            }
            if (is_null($res)) {
                Log::error('Why is the response null?', $request->all());
            }info('oo2');
            // TODO: recheck easypaisa_callback once
            $easypaisa = PaymentGateway::find('easypaisa');
            if ($res['store_id'] == $easypaisa->payments_to
                && $res['transaction_status'] == 'PAID'
                && $res['response_code'] === '0000') {info('oo3');
                // Payment is sent to the expected account
                $inv = Invoice::where('token', $res['order_id'])->firstOrFail();
                info('oo4');
                if ($inv->getAmountToBePaid('easypaisa') == $res['transaction_amount']) {
                    info('oo5');
                    // Expected amount is received
                    // TODO: maybe multiple callbacks should be sent to merchant sites
                    if ($inv->status != 'paid') {
                        $inv->hasBeenPaidVia($easypaisa);
                        info('oo6');
                    }
                    else {
                        Log::info('Easypaisa callback: Invoice already paid. ', [$request->all(), $res]);
                    }

                } else {
                    Log::info('Easypaisa callback: Unexpected amount received. '.
                        $inv->getAmountToBePaid('easypaisa') . "vs".$res['transaction_amount'], [$request->all(), $res]);
                }
            } else {
                info('oo');
            }

//                [
//                    "paid_datetime" => "",
//                    "transaction_id" => "13452764831",
//                    "store_id" => "64109",
//                    "account_number" => null,
//                    "transaction_status" => "FAILED",
//                    "response_code" => "0000",
//                    "payment_token" => "",
//                    "transaction_amount" => "10",
//                    "order_datetime" => "Tue Sep 28 22:12:09 PKT 2021",
//                    "description" => "Success",
//                    "optional5" => "",
//                    "optional4" => "",
//                    "optional3" => "",
//                    "optional2" => "",
//                    "optional1" => "",
//                    "token_expiry_datetime" => "",
//                    "store_name" => "Usman Online Services",
//                    "msisdn" => "03009033630",
//                    "order_id" => "3CYUXH8",
//                    "payment_method" => "MA",
//                ]

        }
    }

    public function edit(Payment $payment)
    {
        //
    }

    public function update(Request $request, Payment $payment)
    {
        //
    }

    public function destroy(Payment $payment)
    {
        //
    }
}
