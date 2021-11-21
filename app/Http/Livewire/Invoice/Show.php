<?php

namespace App\Http\Livewire\Invoice;

use App\Models\Currency;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentGateway;
use App\Models\Store;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rules\In;
use Illuminate\View\Factory;
use Illuminate\View\View;
use Livewire\Component;
use Livewire\Request;

class Show extends Component
{
    public $invoice;
    public $store;
    public $inv_description;

    public $payment_gateways,
           $payeer,
           $jazzcash,
            $paypal,
           $perfect_money,
            $easypaisa = [];

    public $blockchain = [];
    public $alfalah = [];

    public $currency_sign = '';

    public $USD, $INR, $PKR = [];
    public $ep_phone_number = '';
    public $jc_phone_number = '';
    public $easypaisa_screen = 1;
    public $easypaisa_actual_code = '';
    public $easypaisa_code = '';
    public $jazzcash_screen = 1;
    public $jazzcash_actual_code = '';
    public $jazzcash_code = '';

    // TODO can $payment_gateways be access in JavaScript?

    public function mount($zinvoice) {
        $this->invoice = Invoice::where('token', $zinvoice)->firstOrFail();
        $this->store = $this->invoice->store;

        if (is_null($this->store)) {
            abort(404);
            exit;
        }

        $this->currency_sign = Currency::findOrFail($this->invoice->currency_code)->symbol;

        $this->USD = Currency::find('USD');
        $this->PKR = Currency::find('PKR');
        $this->INR = Currency::find('INR');

        // TODO check if something is being missed

        $this->inv_description = "UpzarPay INVOICE # {$this->invoice->token}; {$this->invoice->description}";

        // TODO enabled gateways hee show hongy sirf all ni show hongy
        // Loading basic variables...
        $this->payment_gateways = PaymentGateway::all();
        $this->payeer = $this->payment_gateways->where('name', 'payeer')->first();
        $this->perfect_money = $this->payment_gateways->where('name', 'perfect_money')->first();
        $this->blockchain = $this->payment_gateways->where('name', 'blockchain_btc')->first();
        $this->alfalah = $this->payment_gateways->where('name', 'alfalah')->first();
        $this->jazzcash = $this->payment_gateways->where('name', 'jazzcash')->first();
        $this->paypal = $this->payment_gateways->where('name', 'paypal')->first();
        $this->easypaisa = $this->payment_gateways->where('name', 'easypaisa')->first();
//      AWvwvsnRLHJhR36eCJCkrFUEWB9H3egcNnLMU0FQYp9nA6YrYa6bu5bXlu8ldsawJB4PSStK_rR28r0aAWvwvsnRLHJhR36eCJCkrFUEWB9H3egcNnLMU0FQYp9nA6YrYa6bu5bXlu8ldsawJB4PSStK_rR28r0a
        // Settings for Alfalah payment gateway
        $this->alfalah->return_url = route('invoice.show', $this->invoice->token);

        $this->alfalah->trx_ref_num = $this->invoice->token;
        $this->alfalah->dataToEncrypt =
            "HS_RequestHash=&HS_IsRedirectionRequest=1&HS_ChannelId=1001&HS_ReturnURL={$this->alfalah->return_url}&HS_MerchantId={$this->alfalah->payments_to}&HS_StoreId={$this->alfalah->other_data['store_id']}&HS_MerchantHash={$this->alfalah->other_data['merchant_hash']}&HS_MerchantUsername={$this->alfalah->other_data['merchant_username']}&HS_MerchantPassword={$this->alfalah->other_data['merchant_password']}&HS_TransactionReferenceNumber={$this->alfalah->trx_ref_num}&handshake=";

        $this->alfalah->iv = $this->alfalah->other_data['key2'];

        $this->alfalah->request_hash = openssl_encrypt(utf8_encode($this->alfalah->dataToEncrypt), 'AES-128-CBC', $this->alfalah->other_data['key1'],OPENSSL_RAW_DATA, $this->alfalah->iv);
        $this->alfalah->request_hash = base64_encode($this->alfalah->request_hash);

        $this->alfalah->AuthToken = request('AuthToken');

        // Settings for Jazzcash payment gateway
        $orderId = $this->invoice->id;
        $this->jazzcash->orderId = $orderId;

        $this->jazzcash->ExpiryTime = date('YmdHis', strtotime("+3 hours"));
        $this->jazzcash->TxnDateTime = date('YmdHis', strtotime("+0 hours"));
        $this->jazzcash->_TxnRefNumber = $orderId."T".time();

        $this->jazzcash->_AmountTmp = $this->invoice->getAmountToBePaid('jazzcash');
        $this->jazzcash->_AmountTmp = explode('.', $this->jazzcash->_AmountTmp)[0];

        $this->jazzcash->MerchantId = '00111122';
        $this->jazzcash->MerchantPass = '8st2b10189';

        $secret = 't9s7c7v0au';
        $this->jazzcash->ReturnURL = route('invoice.show', $this->invoice->token);
        $str = "$secret&{$this->jazzcash->_AmountTmp}&$orderId&test&EN&{$this->jazzcash->MerchantId}&{$this->jazzcash->MerchantPass}&$orderId&{$this->jazzcash->ReturnURL}&PKR&$this->jazzcash->TxnDateTime&$this->jazzcash->ExpiryTime&{$this->jazzcash->_TxnRefNumber}&1.1";
        // $IntegritySalt.'&'.$_FormattedAmount.'&'.$OrderID.'&'.$Description.'&'.$Language.'&'.$pp_MerchantID.'&'.$pp_Password.'&'.$pp_ReturnURL.'&'.$Currency.'&'.$TrxnDateTime.'&'.$TrxnExpDateTime.'&'.$this->jazzcash->_TxnRefNumber.'&'.$Version.'&'.'1'.'&'.'2'.'&'.'3'.'&'.'4'.'&'.'5';
        // 		$pp_secureHash = hash_hmac('sha256', $SortedArrayOld, $IntegritySalt);
        $this->jazzcash->hash = hash_hmac('sha256', $str, $secret);

    }

    public function render()
    {
        $is_success = \request('success');
        if (!is_null($is_success) && $is_success === 'true' && !is_null(request('AuthToken'))) {
            return view('api.alfalah_proceed')
                ->layout('layouts.guest');
        } else {
            return view('invoice.show')
                ->layout('layouts.guest');
        }
    }


    public function easypaisa_verify() {
        $this->validate([
            'ep_phone_number' => 'required|numeric'
        ]);
        $rand = mt_rand(100000, 999999);
        $this->easypaisa_actual_code = encrypt("$rand:$this->ep_phone_number");
        $this->emit('notification', Http::get('https://sendpk.com/api/sms.php', [
            "api_key" => "923017868250-8c913d54-a2b8-4693-afe0-a82d695cffca",
            "sender" => 'SMS Alert',
            'mobile' => $this->ep_phone_number,
            'message' => "Your verification code is $rand."
        ])->body());
        $this->easypaisa_screen = 2;
    }

    public function easypaisa_confirm() {
        $this->validate([
            'easypaisa_code' => 'required|numeric|max:999999'
        ]);
        if ("$this->easypaisa_code:$this->ep_phone_number" == decrypt($this->easypaisa_actual_code))  {
            $res = Http::withHeaders([
                'Credentials' => 'VXNtYW5PbmxpbmVTZXJ2aWNlczo1ZjZhZTdhYTVhNGI1NTM3ZmM0OWZjOGVkZGI2ZTQ3'
            ])->post('https://easypay.easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction', [
                "orderId" => $this->invoice->token,
                "storeId" => $this->easypaisa->payments_to,
                "transactionAmount" => $this->invoice->getAmountToBePaid('easypaisa'),
                "transactionType" => "MA",
                "mobileAccountNo" => $this->ep_phone_number,
                // TODO Change email address below
                "emailAddress" => "zainthebest26@gmail.com"
            ])->body();
            $res = json_decode($res, true);
            if ($res['responseCode'] === '0001') {
                $this->easypaisa_code = '';
                $this->easypaisa_screen = 3;
            } else {
                $this->redirect(route('invoice.show', $this->invoice->token).'#'.$res['responseCode']);
            }
        }
        else {
            dd('Wrong code');
        }
    }

    public function jazzcash_verify() {
        $this->validate([
            'jc_phone_number' => 'required|numeric'
        ]);
        $rand = mt_rand(100000, 999999);
        $this->jazzcash_actual_code = encrypt("$rand:$this->jc_phone_number");

        $this->emit('notification', Http::get('https://sendpk.com/api/sms.php', [
            "api_key" => "923017868250-8c913d54-a2b8-4693-afe0-a82d695cffca",
            "sender" => 'SMS Alert',
            'mobile' => $this->jc_phone_number,
            'message' => "Your verification code is $rand."
        ])->body());
        $this->jazzcash_screen = 2;
    }

    public function jazzcash_confirm() {
        $this->validate([
            'jazzcash_code' => 'required|numeric|max:999999'
        ]);
        if ("$this->jazzcash_code:$this->jc_phone_number" == decrypt($this->jazzcash_actual_code))  {
            dd('Not working yet.');
            // https://payments.jazzcash.com.pk/PayAxisExternalStatusService/StatusService_v11.svc?wsdl
            $res = Http::withHeaders([
                'Credentials' => 'VXNtYW5PbmxpbmVTZXJ2aWNlczo1ZjZhZTdhYTVhNGI1NTM3ZmM0OWZjOGVkZGI2ZTQ3'
            ])->post('https://easypay.jazzcash.com.pk/easypay-service/rest/v4/initiate-ma-transaction', [
                "orderId" => $this->invoice->token,
                "storeId" => $this->jazzcash->payments_to,
                "transactionAmount" => $this->invoice->getAmountToBePaid('jazzcash'),
                "transactionType" => "MA",
                "mobileAccountNo" => $this->jc_phone_number,
                // TODO Change email address below
                "emailAddress" => "zainthebest26@gmail.com"
            ])->body();
            $res = json_decode($res, true);
            if ($res['responseCode'] === '0001') {
                $this->jazzcash_code = '';
                $this->jazzcash_screen = 3;
            } else {
                $this->redirect(route('invoice.show', $this->invoice->token).'#'.$res['responseCode']);
            }
        }
        else {
            dd('Wrong code');
        }
    }

    public function refreshingStatus() {
        $freshInvoice = Invoice::where('token', $this->invoice->token)->first('status');
        if ($this->invoice->status !== $freshInvoice->status) {
            $this->invoice->refresh();
        }
    }

//    public function callback() {
//        $this->invoice->sendCallback();
//        $this->emit('notification', 'IPN has been sent');
//    }
}
