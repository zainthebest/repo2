<div>
    <x-slot name="header">
        <span class="text-gray-500">{{ __('Manage stores') }}</span>
        /
        <span>Store settings</span>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl flex flex-col mx-auto px-3 lg:px-8">
            <div class="text-gray-500">

                <form wire:submit.prevent="submitForm" id="addStoreForm">
                    <div class="mb-3">
                        <x-jet-label value="{{ __('Store Name') }}" for="storeName"/>
                        <x-jet-input id="storeName" type="text" class="mt-1 block w-full"
                                     wire:model.defer="store.name"/>
                        <x-jet-input-error for="store.name" class="mt-2"/>
                    </div>

                    <div class="mb-3">
{{--                        TODO change the label below--}}
{{--                        TODO website_url can't be modified, but malicious users can do this now, stop this to happen. Haha simply remove rule for website_url--}}
                        <x-jet-label value="{{ __('Website URL e.g. http://example.com') }}" for="domainName"/>
                        <x-jet-input disabled id="domainName" type="text" class="mt-1 block w-full bg-gray-50"
                                     wire:model.defer="store.website_url" />
                        <x-jet-input-error for="store.website_url" class="mt-2"/>
                    </div>

                    <div class="mb-3">
                        <x-jet-label value="{{ __('Enabled payment methods') }}"/>
{{--                        {{ $store }}--}}

                        <div class="flex ">
                            @foreach($this->store->getApprovedPaymentGateways() as $pg)
                                <x-jet-label class="border-4  mt-2 inline-flex px-1 py-1 items-center">
                                    <x-jet-checkbox wire:model.defer="user_allowed_pay_gateways_new.{{ $pg->name }}" />
                                    <span class="ml-2 text-sm text-gray-600">{{ $pg->display_name }}</span>
                                </x-jet-label>
                            @endforeach
{{--                            --}}
{{--                        </div>--}}
{{--                        <div>--}}
                            @foreach($this->store->getNotApprovedPaymentGateways() as $pg)
                                <x-jet-popup id="approvalRequiredWarningFor_{{ $pg->name }}" maxWidth="md">
                                    <x-slot name="activator">
                                        <x-jet-label class="border-4 opacity-60 mt-2 inline-flex px-1 py-1 items-center cursor-not-allowed">
                                            <x-jet-checkbox disabled />
                                            <span class="ml-2 text-sm text-gray-600">{{ $pg->display_name }}</span>
                                        </x-jet-label>
                                    </x-slot>

                                    <!-- Modal contents -->
                                    <div class="px-6 py-4">
                                        Please contact us for approval to accept payments via {{ $pg->display_name }}. Approval is required to accept payments using this payment gateway.

                                        <div class="mt-6">
                                            <x-jet-button type="button" @click="show = false">Ok, thanks!</x-jet-button>
                                        </div>
                                    </div>
                                </x-jet-popup>
                            @endforeach
                        </div>
                        <span class="text-sm">Some payment methods require admin approval to be used</span>

                        <x-jet-input-error for="store.user_allowed_pay_gateways" class="mt-2"/>
                    </div>

                    <div class="mb-3">
                        <x-jet-label value="{{ __('Success URL') }}" for="successURL"/>
                        <x-jet-input id="successURL" type="text" class="mt-1 block w-full"
                                     wire:model.defer="store.success_url"/>
                        <x-jet-input-error for="store.success_url" class="mt-2"/>
                    </div>

                    <div class="mb-3">
                        <x-jet-label value="{{ __('Fail URL') }}" for="failURL"/>
                        <x-jet-input id="failURL" type="text" class="mt-1 block w-full"
                                     wire:model.defer="store.fail_url"/>
                        <x-jet-input-error for="store.fail_url" class="mt-2"/>
                    </div>
                    <div class="mb-3">
                        <x-jet-label value="{{ __('Callback/Status URL') }}" for="callbackURL"/>
                        <x-jet-input id="callbackURL" type="text" class="mt-1 block w-full"
                                     wire:model.defer="store.callback_url"/>
                        <x-jet-input-error for="store.callback_url" class="mt-2"/>
                    </div>
                    <div class="mb-3">
                        <x-jet-label value="{{ __('Secret Key') }}" for="secretKey"/>
                        <x-jet-input id="secretKey" type="password" class="mt-1 block w-full"
                                     wire:model.defer="store.secret_key"  placeholder="(unchanged)" />
                        <x-jet-input-error for="store.secretKey" class="mt-2"/>
                    </div>
                    <div class="mb-3">
                        <x-jet-label value="{{ __('Who pays commission') }}" for="fee_payer"/>
                        <x-select id="fee_payer" class="mt-1 block w-full" wire:model.defer="store.fee_payer">
                            <option value="both">Merchant/Customer</option>
                            <option value="payee">Merchant only</option>
                            <option value="payer">Customer only</option>
                        </x-select>
                        <p class="text-sm text-gray-500">
                            This setting will only affect newly created invoices.
                        </p>
                        <x-jet-input-error for="store.fee_payer" class="mt-2"/>
                    </div>


                    <x-jet-secondary-link
                        href="{{ route('stores.index') }}"
                        class="ml-2">
                        Back
                    </x-jet-secondary-link>
                    <x-jet-button
                        type="submit"
                        class="ml-2" dusk="button" wire:loading.attr="disabled">
                        Save settings
                    </x-jet-button>
                    <span class="text-green-500 font-bold text-lg">{{ $msg }}</span>
                </form>
            </div>
        </div>
    </div>
</div>
