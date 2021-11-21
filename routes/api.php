<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|

curl -v POST https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -H "Accept: application/json" \
  -H "Accept-Language: en_US" \
  -u "AWvwvsnRLHJhR36eCJCkrFUEWB9H3egcNnLMU0FQYp9nA6YrYa6bu5bXlu8ldsawJB4PSStK_rR28r0a:EE2c1s3Ng3wGpqkXvynJFfcrs1hRYt4sjQ44gsMaJtzOktPmFEolXgEcB89LFqpw85KmDb8F7Px0ku7m" \
  -d "grant_type=client_credentials"


*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/pm_callback', [PaymentController::class, 'perfect_money_callback'])->name('api.perfect_money.callback');

Route::any('/pm_return', [PaymentController::class,'show'])->name('api.perfect_money.return');
Route::get('/payeer_return', [PaymentController::class,'show'])->name('api.payeer.return');
Route::post('/payeer_callback', [PaymentController::class,'payeer_callback'])->name('api.payeer.callback');

Route::post('/btc_blockchain_callback', [PaymentController::class, 'blockchain_callback'])->name('api.blockchain.callback');

Route::any('/alfalah_callback', [PaymentController::class, 'alfalah_callback'])->name('api.alfalah.callback');
Route::post('/paypal_callback_10', [PaymentController::class, 'paypal_callback'])->name('api.paypal.callback');
Route::post('/easypaisa_callback', [PaymentController::class, 'easypaisa_callback'])->name('api.easypaisa.callback');

/*
Route::get('/alfalah_return', function (Request $request) {

    $return_url = route('invoice.show', 1);
    $merchant_id = '3427';
    $store_id = '012170';
    $merchant_hash = 'OUU362MB1ur5v1orWzXlHBAR73/LBY5jBN98EdVGB3mz7613htCdvLkIzzNozr1e';
    $merchant_username = 'lavanu';
    $merchant_password = 'oHU8IadMnXBvFzk4yqF7CA==';

    $key1 = 'haqp8aRvp9YwbP5u';
    $key2 = '6985039530655068';

    $trx_ref_num = '1122';
    $dataToEncrypt = "HS_RequestHash=&HS_IsRedirectionRequest=1&HS_ChannelId=1001&HS_ReturnURL=$return_url&HS_MerchantId=$merchant_id&HS_StoreId=$store_id&HS_MerchantHash=$merchant_hash&HS_MerchantUsername=$merchant_username&HS_MerchantPassword=$merchant_password&HS_TransactionReferenceNumber=$trx_ref_num&handshake=";

    $iv = $key2;

    $request_hash = openssl_encrypt(utf8_encode(
        $dataToEncrypt
    ), 'AES-128-CBC', utf8_encode($key1),
        OPENSSL_RAW_DATA, utf8_encode($iv));
    $request_hash = base64_encode($request_hash);

    return <<<EOF

    <style>
        input {
        width: 100%;
        }
    </style>
     <script
       src="https://code.jquery.com/jquery-1.12.4.min.js"
       integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ="
       crossorigin="anonymous"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js"></script>

     <input id="Key1" name="Key1" type="hidden" value="$key1">
     <input id="Key2" name="Key2" type="hidden" value="$key2">


     <h3>Page Redirection Request</h3>
     <form action="https://payments.bankalfalah.com/SSO/SSO/SSO" id="PageRedirectionForm" method="post" novalidate="novalidate">
     	auth token<input id="AuthToken" name="AuthToken" type="text" value="$request->AuthToken" placeholder="">
     	Request hash
     	<input id="RequestHash" name="RequestHash" type="text" value="">
     	<input id="ChannelId" name="ChannelId" type="hidden" value="1001">
     	<input id="Currency" name="Currency" type="hidden" value="PKR">
     	<input id="ReturnURL" name="ReturnURL" type="hidden" value="$return_url">
         <input id="MerchantId" name="MerchantId" type="hidden" value="$merchant_id">
         <input id="StoreId" name="StoreId" type="hidden" value="$store_id">
     	<input id="MerchantHash" name="MerchantHash" type="hidden" value="$merchant_hash">
     	<input id="MerchantUsername" name="MerchantUsername" type="hidden" value="$merchant_username">
     	<input id="MerchantPassword" name="MerchantPassword" type="hidden" value="$merchant_password">
         <select autocomplete="off" id="TransactionTypeId" name="TransactionTypeId">
             <option value="">Select Transaction Type</option>
             <option value="1">Alfa Wallet</option>
             <option value="2">Alfalah Bank Account</option>
             <option value="3" selected>Credit/Debit Card</option>
         </select>
         <br>
         TransactionReferenceNumber
     	<input autocomplete="off" id="TransactionReferenceNumber" name="TransactionReferenceNumber" placeholder="Order ID" type="text" value="$trx_ref_num">
     	amount
     	<input autocomplete="off"  id="TransactionAmount" name="TransactionAmount" placeholder="Transaction Amount" type="text" value="">
     	<button type="submit" class="btn btn-custon-four btn-danger" id="run">RUN</button>
     </form>

     <script type="text/javascript">
        $(function () {

    $("#handshake").click(function (e) {
        e.preventDefault();
        $("#handshake").attr('disabled', 'disabled');
        submitRequest("HandshakeForm");
        if ($("#HS_IsRedirectionRequest").val() == "1") {
            document.getElementById("HandshakeForm").submit();
        }
        else {
            var myData = {
                HS_MerchantId : $("#HS_MerchantId").val(),
                HS_StoreId : $("#HS_StoreId").val(),
                HS_MerchantHash : $("#HS_MerchantHash").val(),
                HS_MerchantUsername : $("#HS_MerchantUsername").val(),
                HS_MerchantPassword : $("#HS_MerchantPassword").val(),
                HS_IsRedirectionRequest : $("#HS_IsRedirectionRequest").val(),
                HS_ReturnURL : $("#HS_ReturnURL").val(),
                HS_RequestHash : $("#HS_RequestHash").val(),
                HS_ChannelId: $("#HS_ChannelId").val(),
                HS_TransactionReferenceNumber: $("#HS_TransactionReferenceNumber").val(),
            }


            $.ajax({
                type: 'POST',
                url: 'https://payments.bankalfalah.com/HS/HS/HS',
                contentType: "application / json; charset = utf - 8",
                data: JSON.stringify(myData),
                dataType: "json",
                beforeSend: function () {
                },
                success: function (r) {
                    if (r != '') {
                        if (r.success == "true") {
                            $("#AuthToken").val(r.AuthToken);
                            $("#ReturnURL").val(r.ReturnURL);
                            alert('Success: Handshake Successful');
                        }
                    }
                },
                error: function (error) {
                    alert('Error: An error occurred');
                },
                complete: function(data) {
                    $("#handshake").removeAttr('disabled', 'disabled');
                }
            });
        }

    });

    $("#run").click(function (e) {
        e.preventDefault();
        submitRequest("PageRedirectionForm");
        document.getElementById("PageRedirectionForm").submit();
         });
     });

     function submitRequest(formName) {

        var mapString = '', hashName = 'RequestHash';
        if (formName == "HandshakeForm") {
            hashName = 'HS_' + hashName;
        }

        $("#" + formName+" :input").each(function () {
            if ($(this).attr('id') != '') {
                mapString += $(this).attr('id') + '=' + $(this).val() + '&';
            }
        });

        $("#" + hashName).val(CryptoJS.AES.encrypt(
            CryptoJS.enc.Utf8.parse(
                mapString.substr(0, mapString.length - 1)
            ),
            CryptoJS.enc.Utf8.parse(
                $("#Key1").val()
            ),
            {
                keySize: 128 / 8,
                iv: CryptoJS.enc.Utf8.parse($("#Key2").val()),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }));

     }

     </script>





EOF;

})->name('api.alfalah.return');*/
//
// Only accept POST requests
Route::any('/merchant', [\App\Http\Controllers\InvoiceController::class, 'store'])->name('api.merchant_form');
Route::middleware(['auth:sanctum', 'can:withdraw_funds'])
    ->any('/user/transfer_funds', [\App\Http\Controllers\PaymentController::class, 'api_transfer_funds'])
    ->name('api.user.transfer_funds');


Route::any('/a', function (\Illuminate\Http\Request $request) {
    print_r($request->all());
    var_export($request->hacked == "assd55");
});


// api_key secret_key abilities
//rg8PxHAwKbSgaM8graskzwkVj8r0RPH1WwzvCsne
