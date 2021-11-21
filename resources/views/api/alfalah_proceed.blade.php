<div class="p-2">
    @php
    // TODO check security...

        $request_hash = '';
        $fields = [
            "AuthToken" => $alfalah->AuthToken,
            "RequestHash" => '',
            "ChannelId" => '1001',
            "Currency" => 'PKR',
            "ReturnURL" => $alfalah->return_url,
            "MerchantId" => $alfalah->payments_to,
            "StoreId" => $alfalah->other_data['store_id'],
            "MerchantHash" => $alfalah->other_data['merchant_hash'],
            "MerchantUsername" => $alfalah->other_data['merchant_username'],
            "MerchantPassword" => $alfalah->other_data['merchant_password'],
             "TransactionTypeId" => '3',
            "TransactionReferenceNumber" => $alfalah->trx_ref_num,
            "TransactionAmount" => $invoice->getAmountToBePaid('alfalah'),
];
        $string = '';
        foreach ($fields as $fieldName => $fieldVal) {
            $string .= "$fieldName=$fieldVal&";
        }

        $string .= 'run=';
        $request_hash = openssl_encrypt(utf8_encode($string), 'AES-128-CBC', utf8_encode($alfalah->other_data['key1']),OPENSSL_RAW_DATA, utf8_encode($alfalah->iv));
        $request_hash = base64_encode($request_hash);
        //$request_hash = $string;
    @endphp
    <h3 class="text-2xl">Redirecting to the payment page...</h3>
    <form action="https://payments.bankalfalah.com/SSO/SSO/SSO" name="theForm" method="post"
          novalidate="novalidate">
        <input id="AuthToken" name="AuthToken" type="hidden" value="{{ $alfalah->AuthToken }}" placeholder="">
        <input id="RequestHash" name="RequestHash" type="hidden" value="{{ $request_hash }}">
        <input id="ChannelId" name="ChannelId" type="hidden" value="1001">
        <input id="Currency" name="Currency" type="hidden" value="PKR">
        <input id="ReturnURL" name="ReturnURL" type="hidden" value="{{ $alfalah->return_url }}">
        <input id="MerchantId" name="MerchantId" type="hidden" value="{{ $alfalah->payments_to }}">
        <input id="StoreId" name="StoreId" type="hidden" value="{{ $alfalah->other_data['store_id'] }}">
        <input id="MerchantHash" name="MerchantHash" type="hidden" value="{{ $alfalah->other_data['merchant_hash'] }}">
        <input id="MerchantUsername" name="MerchantUsername" type="hidden" value="{{ $alfalah->other_data['merchant_username'] }}">
        <input id="MerchantPassword" name="MerchantPassword" type="hidden" value="{{ $alfalah->other_data['merchant_password'] }}">
        <select hidden autocomplete="off" id="TransactionTypeId" name="TransactionTypeId">
            <option value="">Select Transaction Type</option>
            <option value="1">Alfa Wallet</option>
            <option value="2">Alfalah Bank Account</option>
            <option value="3" selected>Credit/Debit Card</option>
        </select>
        <input autocomplete="off" id="TransactionReferenceNumber" name="TransactionReferenceNumber"
               placeholder="Order ID" type="hidden" value="{{ $alfalah->trx_ref_num }}">
        <input autocomplete="off" hidden id="TransactionAmount" name="TransactionAmount" placeholder="Transaction Amount"
               type="text" value="{{ $invoice->getAmountToBePaid('alfalah') }}">
        If you are not being redirected <button type="submit" class="text-red-500 underline" id="run">click here</button>

    </form>
    <script>
        window.addEventListener('load', function () {
            document.forms.theForm.submit();
        });
    </script>

</div>
