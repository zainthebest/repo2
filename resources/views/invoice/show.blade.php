<div class="min-h-screen flex flex-col justify-between items-center pt-0 sm:pt-6 bg-gray-100" style="gap: 1.25rem;">
    <script>
        window.addEventListener('load', function () {
            setTimeout(function () {
                // window.location.reload(true);
                // TODO keep invoice status up-to-date
            }, 4000);
        });
    </script>
    <style>
        .pg-button {
            background: #ffffffd1;
            border-radius: 1000px;
            font-weight: 600;
        }

        .pg-button:hover {
            background: #ffffffd1;
        }

        /*.pg-button:focus-within{*/
        /*    outline: none;*/
        /*    background: #222222;*/
        /*}*/

        @media (min-width: 480px) {
            .invoice-area {
                max-width: 25rem;
                margin-top: 1.5rem;
            }
        }

        .invoice-area {
            border: 1px solid #ddd;
        }

    </style>

    <div
        @keydown.escape.window="selectedPG = null"
        {{--        x-bind:style="'height: 410px;'"--}}
        x-bind:style="'height: ' +  invoiceMainHeight + 'px;'"
        x-data="{selectedPG:null,
            showInvDetails: false,
            get invoiceMainHeight() {
            return ($el.scrollHeight > 400) ? $el.scrollHeight : 400
            }
        }"
        class="w-full relative text-gray-600 invoice-area shadow-md sm:rounded-lg overflow-hidden"
        {{--         style="background: linear-gradient(45deg, #b082bf, #ff006a);--}}
        {{--         color: #fff;"--}}
    >
        <div
            x-show="selectedPG == null"
            x-transition:enter="transition duration-500"
            x-transition:enter-start="opacity-0 transform -translate-x-full"
            x-transition:enter-end="opacity-100 transform -translate-x-0"
            x-transition:leave="transition duration-500"
            x-transition:leave-start="opacity-100 transform -translate-x-0"
            x-transition:leave-end="opacity-0 transform -translate-x-full"
            class="absolute w-full"
        >
            <div class="pb-3 pt-4 px-6 bg-white">
                <div class="text-3xl">
                    {{ $currency_sign }} {{ $invoice->amount }}
                    <div class="float-right" @click="showInvDetails = !showInvDetails">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
                <div class="text-sm" style="color: #939090;" wire:poll.keep-alive="refreshingStatus">
                    Pay to: {{ $invoice->store->name }}
                </div>
            </div>

            <div class="transition-all duration-1000 overflow-hidden max-h-0 absolute w-full bg-white px-6"
                 x-bind:style="(showInvDetails ? 'max-height:'+'600px;'+ '' : 'max-height:0;')"
                 :class="showInvDetails ? 'shadow-md': ''"
            >
                <hr class="mb-3">
                <div class="font-semibold">Product Description</div>
                <div class="pb-3">
                    @if($invoice->description == '')
                        Not available
                    @else
                        {{ $invoice->description }}
                    @endif
                </div>
            </div>
            <hr>
            @if($invoice->status == 'paid')
                <div class="mt-5 px-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="text-green-600 h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-gray-600">Payment has been received. Payment transaction
                        id {{ $invoice->payment()->id }}</p>
                {{--        TODO $invoice->store->return_url vs $store->return_url - donon mai kuch khas faraq to nhi --}}
                <!--<x-link href="{{ $invoice->store->success_url }}" class="mt-8 inline-block">Return to merchant site</x-link>-->
                    <br><br><br>
                    <form action="{{ $invoice->store->success_url }}" method="POST">
                        <input type="hidden" name="transaction_id" value="{{ $invoice->payment()->id }}">
                        <input type="hidden" name="order_id" value="{{ $invoice->order_id }}">
                        <input type="hidden" name="invoice_amount" value="{{ $invoice->amount }}">
                        <input type="hidden" name="invoice_currency" value="{{ $invoice->currency_code }}">
                        <input type="hidden" name="invoice_status" value="paid">
                        <x-primary-button name="return_success">
                            Return to merchant site
                        </x-primary-button>
{{--                        <x-primary-button wire:click="callback" type="button">--}}
{{--                            Send IPN--}}
{{--                        </x-primary-button>--}}
                        {{--                        <inp--}}
                    </form>
                </div>
            @else
                <div class="mt-5 px-6 pb-4">
                    <div class="font-semibold ">
                        Select a payment method
                    </div>
                    {{--            <p>--}}
                    {{--                {{ dd($store->user_allowed_pay_gateways) }}--}}
                    {{--            </p>--}}
                    <div class="mt-4 max-h-64 overflow-auto" style="
                    display: grid;
                    grid-gap: 10px;
                    grid-template-columns: repeat(2, 1fr);">
                        <!-- Perfect money model -->
                        @if($store->acceptsPaymentVia('perfect_money'))

                            <button class="p-2 block w-full px-5 pg-button" @click="selectedPG='perfect_money'">
                                {{ $perfect_money->display_name }}
                            </button>
                        @endif
                        @if($store->acceptsPaymentVia('payeer'))

                            <button class="p-2 block w-full px-5 pg-button" @click="selectedPG='payeer'">
                                {{ $payeer->display_name }}
                            </button>
                        @endif
                        @if(false)
                            <x-jet-popup id="bitcoin_model" maxWidth="md" bg="bg-gray-100 opacity-100" valign="top"
                                         class="mt-6" shadow="">
                                <x-slot name="activator">
                                    <button class="p-2 block w-full px-5 pg-button">
                                        {{ $blockchain->display_name }}
                                    </button>
                                </x-slot>

                                <div class="text-gray-400 p-2 font-semibold">
                                    <button @click="show = false">< Back</button>
                                </div>

                                <!-- Modal contents -->
                                <div class="px-6 py-4">
                                    <b class="text-lg">Scan this Qr Code on your device</b>
                                    <br>
                                    <img class="mx-auto"
                                         src="https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl={{ urlencode("bitcoin:$invoice->btc_address?amount=".$invoice->getAmountToBePaid('blockchain_btc')) }}&choe=UTF-8"
                                         alt="btc address qr code">
                                    <x-jet-input type="text" readonly class="w-full"
                                                 value="{{ $invoice->btc_address }}"></x-jet-input>
                                    <div class="grid grid-flow-col grid-cols-2 text-md mt-3">
                                        <div>
                                            Total to pay:
                                        </div>
                                        <b class="text-lg">BTC {{ $invoice->getAmountToBePaid('blockchain_btc') }}</b>
                                    </div>
                                    <div class="text-md text-gray-500">Fee
                                        of {{ $invoice->getFeeForPayer('blockchain_btc') }} BTC apply
                                    </div>
                                </div>


                                <a href="bitcoin:{{ $invoice->btc_address }}?amount={{ $invoice->getAmountToBePaid('blockchain_btc') }}"
                                   class="ml-7 inline-block mx-auto bg-blue-500 shadow-md text-white mt-10 mb-4 py-3 text-xl font-bold px-6">
                                    Pay with wallet
                                </a>

                            </x-jet-popup>
                        @endif

                        @if($store->acceptsPaymentVia('alfalah'))
                            <button class="p-2 block w-full px-5 pg-button" @click="selectedPG='alfalah'">
                                {{ $alfalah->display_name }}
                            </button>
                        @endif

                        @if($store->acceptsPaymentVia('internal_transfer'))

                            <form action="{{ route('invoice.pay_with_funds', $invoice->token) }}"
                                  method="get">
                                <button class="p-2 block w-full px-5 pg-button">
                                    UpzarPay
                                </button>
                            </form>
                        @endif

                        @if($store->acceptsPaymentVia('jazzcash'))
                            <button class="p-2 block w-full px-5 pg-button" @click="selectedPG='jazzcash'">
                                {{ $jazzcash->display_name }}
                            </button>
                        @endif

                        @if($store->acceptsPaymentVia('paypal'))
                            <button class="p-2 block w-full px-5 pg-button" @click="selectedPG='paypal'">
                                {{ $paypal->display_name }}
                            </button>
                        @endif
                        @if($store->acceptsPaymentVia('easypaisa'))
                            <button class="p-2 block w-full px-5 pg-button" @click="selectedPG='easypaisa'">
                                {{ $easypaisa->display_name }}
                            </button>
                        @endif
                    </div>
                </div>
            @endif
        </div>

        <div x-show="selectedPG == 'perfect_money'"
             x-transition:enter="transition duration-500"
             x-transition:enter-start="opacity-0 transform translate-x-full"
             x-transition:enter-end="opacity-100 transform translate-x-0"
             x-transition:leave="transition duration-500"
             x-transition:leave-start="opacity-100 transform translate-x-0"
             x-transition:leave-end="opacity-0 transform translate-x-full"
             class="absolute w-full h-full bg-white flex flex-col"
        >
            <!-- Modal contents -->
            <div class="px-6 py-8">
                <p>You've selected <strong>Perfect Money</strong> as the payment method</p>

                <img class="w-64 mx-auto mt-3"
                     src="https://logos-download.com/wp-content/uploads/2019/11/Perfect_Money_Logo_full.png"
                >
                <br>
                <div class="font-bold text-lg">
                    You will pay:
                    {{ $USD->symbol }} {{ $invoice->getAmountToBePaid('perfect_money') }}
                </div>
                <div class="">
                    Fee of {{ $USD->symbol }} {{ $invoice->getFeeForPayer('perfect_money') }}
                    apply
                </div>
            </div>


            <form action="https://perfectmoney.com/api/step1.asp" method="POST"
                  class="px-6 flex-grow flex items-end justify-between pb-2">
                <input type="hidden" name="PAYEE_ACCOUNT"
                       value="{{ $perfect_money->payments_to }}">
                <input type="hidden" name="PAYMENT_AMOUNT"
                       value="{{ $invoice->getAmountToBePaid('perfect_money') }}">
                <input type="hidden" name="PAYMENT_UNITS" value="USD">
                <input type="hidden" name="PAYEE_NAME"
                       value="{{ config('app.name') }} - {{ $invoice->store->name }}">

                <input type="hidden" name="PAYMENT_URL"
                       value="{{ route('api.perfect_money.return') }}">
                <input type="hidden" name="NOPAYMENT_URL"
                       value="{{ route('api.perfect_money.return') }}">
                <input type="hidden" name="STATUS_URL"
                       value="{{ route('api.perfect_money.callback') }}">
                <input type="hidden" name="PAYMENT_ID" value="{{ $invoice->token }}">
                <input type="hidden" name="SUGGESTED_MEMO" value="{{ $inv_description }}">
                <x-jet-secondary-button @click="selectedPG = null">
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-left mr-1 h-4 w-4" viewBox="0 0 20 20"
                         fill="currentColor">
                        <path fill-rule="evenodd"
                              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                              clip-rule="evenodd"/>
                    </svg>
                    Back
                </x-jet-secondary-button>
                <x-primary-button>
                    Continue
                </x-primary-button>

            </form>

        </div>
        <div x-show="selectedPG == 'payeer'"
             x-transition:enter="transition duration-500"
             x-transition:enter-start="opacity-0 transform translate-x-full"
             x-transition:enter-end="opacity-100 transform translate-x-0"
             x-transition:leave="transition duration-500"
             x-transition:leave-start="opacity-100 transform translate-x-0"
             x-transition:leave-end="opacity-0 transform translate-x-full"
             class="absolute w-full h-full bg-white flex flex-col"
        >
            <!-- Modal contents -->
            <div class="px-6 py-8">
                <p>You've selected <strong>Payeer</strong> as the payment method</p>

                <img class="w-48 mx-auto mt-3"
                     src="https://iconape.com/wp-content/files/pe/351318/svg/351318.svg"
                >
                <br>
                <div class="font-bold text-lg">
                    You will pay:
                    {{ $USD->symbol }} {{ $invoice->getAmountToBePaid('payeer') }}
                </div>
                <div class="">
                    Fee of {{ $USD->symbol }} {{ $invoice->getFeeForPayer('payeer') }}
                    apply
                </div>
            </div>


            @php

                $m_shop = $payeer->payments_to; // merchant ID
                $m_orderid = $invoice->token; // invoice number in the merchant's invoicing system
                $m_amount = $invoice->getAmountToBePaid('payeer'); // invoice amount with two decimal places following a period
                $m_curr = 'USD'; // invoice currency
                $m_desc = base64_encode($invoice->prodcut_desc); // invoice description encoded using a base64
                $m_key = $payeer->secret_key;
                $arHash = array(
                    $m_shop,
                    $m_orderid,
                    $m_amount,
                    $m_curr,
                    base64_encode($inv_description)
                );

                // Adding the secret key
                $arHash[] = $m_key;
                // Forming a signature
                $sign = strtoupper(hash('sha256', implode(":", $arHash)));
                //$sign = json_encode($arHash);
            @endphp
            <form method="post" action="https://payeer.com/merchant/"
                  class="px-6 flex-grow flex items-end justify-between pb-2">
                <input type="hidden" name="m_shop" value="{{ $payeer->payments_to }}">
                <input type="hidden" name="m_orderid" value="{{ $invoice->token }}">
                <input type="hidden" name="m_amount" value="{{ $m_amount }}">
                <input type="hidden" name="m_curr" value="USD">
                <input type="hidden" name="m_desc" value="{{ base64_encode($inv_description) }}">
                <input type="hidden" name="m_sign" value="{{ $sign }}">

                <x-jet-secondary-button @click="selectedPG = null">
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-left mr-1 h-4 w-4" viewBox="0 0 20 20"
                         fill="currentColor">
                        <path fill-rule="evenodd"
                              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                              clip-rule="evenodd"/>
                    </svg>
                    Back
                </x-jet-secondary-button>
                <x-primary-button name="m_process">
                    Continue
                </x-primary-button>
            </form>

        </div>


        <div x-show="selectedPG == 'jazzcash'"
             x-transition:enter="transition duration-500"
             x-transition:enter-start="opacity-0 transform translate-x-full"
             x-transition:enter-end="opacity-100 transform translate-x-0"
             x-transition:leave="transition duration-500"
             x-transition:leave-start="opacity-100 transform translate-x-0"
             x-transition:leave-end="opacity-0 transform translate-x-full"
             class="absolute w-full h-full bg-white flex flex-col"
        >
            <!-- Modal contents -->
            <div class="px-6 py-8">
                <p>You've selected <strong>Jazzcash</strong> as the payment method</p>

                <img class="w-36 mx-auto mt-3"
                     src="data:image/png;base64,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"
                >
                <br>

                @if($jazzcash_screen == 1 || $jazzcash_screen == 3)
                    <div class="font-bold text-lg">
                        You will pay:
                        {{ $PKR->symbol }} {{ $invoice->getAmountToBePaid('jazzcash') }}
                    </div>
                    <div class="">
                        Fee of {{ $PKR->symbol }} {{ $invoice->getFeeForPayer('jazzcash') }}
                        apply
                    </div>
                @endif
                @if($jazzcash_screen == 1 || $jazzcash_screen == 3)
                    <form class="mt-2 pt-4 border-t-2" wire:submit.prevent="jazzcash_verify">
                        @if($jazzcash_screen == 3)
                            <span class="mb-2 block text-red-600">
                            Transaction failed!
                        </span>
                        @endif
                        <x-jet-label for="jc_phone_number" value="{{ __('Enter your phone number') }}"/>
                        <x-jet-input id="jc_phone_number" type="number" class="block mt-1 w-full"
                                     wire:model.defer="jc_phone_number"/>
                        <x-jet-input-error for="jc_phone_number" class="mt-2"/>

                        <div class="flex mt-2">

                            <x-jet-secondary-button @click="selectedPG = null">
                                <svg xmlns="http://www.w3.org/2000/svg" class="float-left mr-1 h-4 w-4"
                                     viewBox="0 0 20 20"
                                     fill="currentColor">
                                    <path fill-rule="evenodd"
                                          d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                                          clip-rule="evenodd"/>
                                </svg>
                                Back
                            </x-jet-secondary-button>
                            <x-primary-button wire:loading.attr="disabled" wire:target="jazzcash_verify">
                                Send OTP
                            </x-primary-button>
                        </div>
                    </form>
                @endif
                @if($jazzcash_screen == 2)
                    <form class="mt-2 pt-4 border-t-2" wire:submit.prevent="jazzcash_confirm">
                        <span class="mb-2 block text-gray-700">A verification code has been sent to: {{ $jc_phone_number }}. Enter that code below.</span>
                        <x-jet-label for="jazzcash_code" value="{{ __('Enter verification code') }}"/>
                        <x-jet-input id="jazzcash_code" type="number" class="block mt-1 w-full"
                                     wire:model.defer="jazzcash_code"/>
                        <x-jet-input-error for="jazzcash_code" class="mt-2"/>
                        <div class="flex mt-2">

                            <x-jet-secondary-button wire:click="$set('jazzcash_screen', 1)" wire:target="$set" wire:loading.attr="disabled">
                                <svg xmlns="http://www.w3.org/2000/svg" class="float-left mr-1 h-4 w-4"
                                     viewBox="0 0 20 20"
                                     fill="currentColor">
                                    <path fill-rule="evenodd"
                                          d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                                          clip-rule="evenodd"/>
                                </svg>
                                Change number
                            </x-jet-secondary-button>
                            <x-primary-button wire:loading.attr="disabled" wire:target="jazzcash_confirm">
                                Verify
                            </x-primary-button>
                        </div>

                    </form>
                @endif

            </div>

        </div>
        <div x-show="selectedPG == 'easypaisa'"
             x-transition:enter="transition duration-500"
             x-transition:enter-start="opacity-0 transform translate-x-full"
             x-transition:enter-end="opacity-100 transform translate-x-0"
             x-transition:leave="transition duration-500"
             x-transition:leave-start="opacity-100 transform translate-x-0"
             x-transition:leave-end="opacity-0 transform translate-x-full"
             class="absolute w-full h-full bg-white flex flex-col"
        >
            <!-- Modal contents -->
            <div class="px-6 py-8">
                <p>You've selected <strong>Easypaisa</strong> as the payment method</p>

                <img class="w-44 mx-auto mt-3"
                     src="https://easypaisa.com.pk/wp-content/uploads/2019/10/Header-Icon.png"
                >
                <br>

                @if($easypaisa_screen == 1 || $easypaisa_screen == 3)
                    <div class="font-bold text-lg">
                        You will pay:
                        {{ $PKR->symbol }} {{ $invoice->getAmountToBePaid('easypaisa') }}
                    </div>
                    <div class="">
                        Fee of {{ $PKR->symbol }} {{ $invoice->getFeeForPayer('easypaisa') }}
                        apply
                    </div>
                @endif
                @if($easypaisa_screen == 1 || $easypaisa_screen == 3)
                    <form class="mt-2 pt-4 border-t-2" wire:submit.prevent="easypaisa_verify">
                        @if($easypaisa_screen == 3)
                            <span class="mb-2 block text-red-600">
                            Transaction failed!
                        </span>
                        @endif
                        <x-jet-label for="ep_phone_number" value="{{ __('Enter your phone number') }}"/>
                        <x-jet-input id="ep_phone_number" type="number" class="block mt-1 w-full"
                                     wire:model.defer="ep_phone_number"/>
                        <x-jet-input-error for="ep_phone_number" class="mt-2"/>

                        <div class="flex mt-2">
                            <x-jet-secondary-button @click="selectedPG = null">
                                <svg xmlns="http://www.w3.org/2000/svg" class="float-left mr-1 h-4 w-4"
                                     viewBox="0 0 20 20"
                                     fill="currentColor">
                                    <path fill-rule="evenodd"
                                          d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                                          clip-rule="evenodd"/>
                                </svg>
                                Back
                            </x-jet-secondary-button>
                            <x-primary-button wire:loading.attr="disabled" wire:target="easypaisa_verify">
                                Send OTP
                            </x-primary-button>
                        </div>
                    </form>
                @endif
                @if($easypaisa_screen == 2)
                    <form class="mt-2 pt-4 border-t-2" wire:submit.prevent="easypaisa_confirm">
                        <span class="mb-2 block text-gray-700">A verification code has been sent to: {{ $ep_phone_number }}. Enter that code below.</span>
                        <x-jet-label for="easypaisa_code" value="{{ __('Enter verification code') }}"/>
                        <x-jet-input id="easypaisa_code" type="number" class="block mt-1 w-full"
                                     wire:model.defer="easypaisa_code"/>
                        <x-jet-input-error for="easypaisa_code" class="mt-2"/>
                        <div class="flex mt-2">

                            <x-jet-secondary-button wire:click="$set('easypaisa_screen', 1)" wire:loading.attr="disabled" wire:target="$set">
                                <svg xmlns="http://www.w3.org/2000/svg" class="float-left mr-1 h-4 w-4"
                                     viewBox="0 0 20 20"
                                     fill="currentColor">
                                    <path fill-rule="evenodd"
                                          d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                                          clip-rule="evenodd"/>
                                </svg>
                                Change number
                            </x-jet-secondary-button>
                            <x-primary-button wire:loading.attr="disabled" wire:target="easypaisa_confirm">
                                Verify
                            </x-primary-button>
                        </div>

                    </form>
                @endif

            </div>

        </div>


        <div x-show="selectedPG == 'paypal'"
             x-transition:enter="transition duration-500"
             x-transition:enter-start="opacity-0 transform translate-x-full"
             x-transition:enter-end="opacity-100 transform translate-x-0"
             x-transition:leave="transition duration-500"
             x-transition:leave-start="opacity-100 transform translate-x-0"
             x-transition:leave-end="opacity-0 transform translate-x-full"
             class="absolute w-full h-full bg-white flex flex-col"
        >
            <!-- Modal contents -->
            <div class="px-6 py-8">
                <p>You've selected <strong>Paypal</strong> as the payment method</p>

                <img class="w-48 mx-auto mt-3"
                     src="http://assets.stickpng.com/images/580b57fcd9996e24bc43c530.png"
                >
                <br>
                <div class="font-bold text-lg">
                    You will pay:
                    {{ $USD->symbol }} {{ $invoice->getAmountToBePaid('paypal') }}
                </div>
                <div class="">
                    Fee of {{ $USD->symbol }} {{ $invoice->getFeeForPayer('paypal') }}
                    apply
                </div>
            </div>


            <form action="https://www.sandbox.paypal.com/cgi-bin/webscr" method="post"
                  class="px-6 flex-grow flex items-end justify-between pb-2">
                <!-- Identify your business so that you can collect the payments. -->
                <input type="hidden" name="business" value="{{ $paypal->payments_to }}">
                <!-- Specify a Buy Now button. -->
                <input type="hidden" name="cmd" value="_xclick">
                <!-- Specify details about the item that buyers will purchase. -->
                <input type="hidden" name="item_name" value="{{ $inv_description }}">
                <input type="hidden" name="amount"
                       value="{{ $invoice->getAmountToBePaid('paypal') }}">
                <input type="hidden" name="currency_code" value="USD">

                <input type="hidden" name="notify_url" value="{{ route('api.paypal.callback') }}">
                <input type="hidden" name="return"
                       value="{{ route('invoice.show', $invoice->token) }}">

                <!-- Define returning variables -->
                <input type="hidden" name="invoice" value="{{ $invoice->token }}">

                <!-- Display the payment button. -->

                <x-jet-secondary-button @click="selectedPG = null">
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-left mr-1 h-4 w-4" viewBox="0 0 20 20"
                         fill="currentColor">
                        <path fill-rule="evenodd"
                              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                              clip-rule="evenodd"/>
                    </svg>
                    Back
                </x-jet-secondary-button>
                <x-primary-button>
                    Continue
                </x-primary-button>
            </form>

        </div>
        <div x-show="selectedPG == 'alfalah'"
             x-transition:enter="transition duration-500"
             x-transition:enter-start="opacity-0 transform translate-x-full"
             x-transition:enter-end="opacity-100 transform translate-x-0"
             x-transition:leave="transition duration-500"
             x-transition:leave-start="opacity-100 transform translate-x-0"
             x-transition:leave-end="opacity-0 transform translate-x-full"
             class="absolute w-full h-full bg-white flex flex-col"
        >
            <!-- Modal contents -->
            <div class="px-6 py-8">
                <p>You've selected <strong>{{ $alfalah->display_name }}</strong> as the payment method</p>

                <img class="w-36 mx-auto mt-3"
                     src="https://cdn.iconscout.com/icon/free/png-256/credit-card-1795347-1522706.png"
                >
                <br>
                <div class="font-bold text-lg">
                    You will pay:
                    {{ $PKR->symbol }} {{ $invoice->getAmountToBePaid('alfalah') }}
                </div>
                <div class="">
                    Fee of {{ $PKR->symbol }} {{ $invoice->getFeeForPayer('alfalah') }}
                    apply
                </div>
            </div>


            <form action="https://payments.bankalfalah.com/HS/HS/HS" method="post"
                  class="px-6 flex-grow flex items-end justify-between pb-2">
                <input type="hidden" name="HS_RequestHash" value="{{ $alfalah->request_hash }}">
                <input type="hidden" name="HS_IsRedirectionRequest" value="1">
                <input type="hidden" name="HS_ChannelId" value="1001">
                <input type="hidden" name="HS_ReturnURL" value="{{ $alfalah->return_url }}">
                <input type="hidden" name="HS_MerchantId" value="{{ $alfalah->payments_to }}">
                <input type="hidden" name="HS_StoreId"
                       value="{{ $alfalah->other_data['store_id'] }}">
                <input type="hidden" name="HS_MerchantHash"
                       value="{{ $alfalah->other_data['merchant_hash'] }}">
                <input type="hidden" name="HS_MerchantUsername"
                       value="{{ $alfalah->other_data['merchant_username'] }}">
                <input type="hidden" name="HS_MerchantPassword"
                       value="{{ $alfalah->other_data['merchant_password'] }}">
                <input type="hidden" name="HS_TransactionReferenceNumber"
                       value="{{ $alfalah->trx_ref_num }}">

                <x-jet-secondary-button @click="selectedPG = null">
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-left mr-1 h-4 w-4" viewBox="0 0 20 20"
                         fill="currentColor">
                        <path fill-rule="evenodd"
                              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                              clip-rule="evenodd"/>
                    </svg>
                    Back
                </x-jet-secondary-button>
                <x-primary-button>
                    Continue
                </x-primary-button>
            </form>

        </div>
    </div>

    <footer class="text-gray-500 mb-5">
        Powered by <a href="{{ route('landing_page') }}" class="font-bold" target="_blank">
            <x-jet-application-logo/>
        </a>
    </footer>

</div>
