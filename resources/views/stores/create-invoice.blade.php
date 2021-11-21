<div>
    <x-jet-popup id="modalCreateStoreInvoice_{{ $eId }}" class="text-left">
        <x-slot name="activator">
            <button x-on:sloe
                    class="hover:underline text-green-500">
                Create Invoice
            </button>
        </x-slot>

        <div class="px-6 py-4">
            <div class="text-2xl">
                {{--            TODO create a new invoice for store / create a new invoice in store--}}
                Create a new invoice {{ "<$store->name>" }}
            </div>

            <div class="mt-4">
                {!! $response_html !!}


                <form wire:submit.prevent="save" id="formCreateStoreInvoice_{{ $eId }}">
                    <div class="mb-3">
                        <x-jet-label value="{{ __('Invoice Amount') }}" />
                        <x-jet-input type="text" class="mt-1 block w-full"
                                     wire:model.defer="invoice.amount"/>
                        <x-jet-input-error for="invoice.amount" class="mt-2"/>
                    </div>

                    <div class="mb-3">
                        <x-jet-label value="{{ __('Order Id (optional)') }}" />
                        <x-jet-input type="text" class="mt-1 block w-full"
                                     wire:model.defer="invoice.order_id"></x-jet-input>
                        <x-jet-input-error for="invoice.order_id" class="mt-2"></x-jet-input-error>
                    </div>

                    <div class="mb-3">
                        <x-jet-label value="{{ __('Currency Code') }}" />

                        <x-select
                            class="mt-1 block w-full"
                             wire:model.defer="invoice.currency_code">
                            @foreach($currencies as $currency)
                                <option>{{ $currency }}</option>
                            @endforeach
                        </x-select>

                        <x-jet-input-error for="invoice.currency_code" class="mt-2"/>
                    </div>

                    <div class="mb-3">
                        <x-jet-label value="{{ __('Description') }}"/>
                        <x-jet-input type="text" class="mt-1 block w-full"
                                     wire:model.defer="invoice.description" />
                        <x-jet-input-error for="invoice.description" class="mt-2"/>
                    </div>
                </form>
            </div>
        </div>

        <div class="px-6 py-4 bg-gray-100 text-">
            <x-jet-secondary-button
                @click="show = false"
                class="ml-2">
                Cancel
            </x-jet-secondary-button>
            <x-jet-button
                form="formCreateStoreInvoice_{{ $eId }}" type="submit"
                class="ml-2" dusk="button" wire:loading.attr="disabled">
                Create Invoice
            </x-jet-button>

        </div>
    </x-jet-popup>

</div>
