<div class="p-2 max-w-2xl m-auto mt-10">
    {{--    TODO agar 1 waqt mai 2 buttons per click kerain to 1 disabled reh jata hy... doosra enable hojata hy --}}
    <style> 
        .straight-on-sm {
            align-items: baseline;
            row-gap: .6rem;
            column-gap: 1rem;
            grid-template-columns: 1fr;
        }
        .straight-on-sm .mx-auto {
            grid-column: 1 / 1;
            text-align: center;
        }
        @media (min-width: 768px) {
            .straight-on-sm {
                grid-template-columns: minmax(min-content, max-content) auto;
                text-align: right;
            }
            .straight-on-sm .mx-auto {
                grid-column: 1 / 3;
                text-align: center;
            }
        }
    </style>
    @foreach($payment_gateways as $payment_gateway)
        <form class="grid straight-on-sm"
              wire:submit.prevent="save({{ $loop->index }})">
            <b class="text-2xl capitalize mx-auto">{{ implode(" ", explode("_", $payment_gateway->name)) }}</b>
            {{--            <br>--}}
            <div>Display name</div>
            <x-jet-input type="text" wire:model.defer="payment_gateways.{{ $loop->index }}.display_name"/>
            <div>
                Account
            </div>
            <x-jet-input type="text" wire:model.defer="payment_gateways.{{ $loop->index }}.payments_to"/>
            <div>
                Secret Key
            </div>

            <x-jet-input type="text" wire:model.defer="payment_gateways.{{ $loop->index }}.secret_key"/>
            <div>
                Payments hold time
            </div>

            <div class="flex items-center">
                <x-jet-input class="flex-grow" type="text"
                             wire:model.defer="payment_gateways.{{ $loop->index }}.hold_payments_for"/>
                <span>&nbsp;seconds</span>
            </div>
            <div>
                Fixed Fee (USD)
            </div>

            <x-jet-input type="text" wire:model.defer="payment_gateways.{{ $loop->index }}.fee_amount"/>
            <div>
                Fee in percentage (%)
            </div>

            <x-jet-input type="text" wire:model.defer="payment_gateways.{{ $loop->index }}.fee_percentage"/>

            <x-jet-label
                class="border-4  mt-4 mx-auto inline-flex px-1 py-1 items-center">
                <x-jet-checkbox wire:model="payment_gateways.{{ $loop->index }}.requires_approval"/>
                <span class="ml-2 text-sm text-gray-600">{{ __('Requires Approval') }}</span>
            </x-jet-label>

            @if($payment_gateway->name === 'internal_transfer')
                <div>
                    2nd Fixed fee (USD)
                </div>

                <x-jet-input type="text" class="bg-red-100"
                             wire:model.defer="payment_gateways.{{ $loop->index }}.other_data.second_fee_amount"/>
                <div>
                    2nd Fee in percentage (%)
                </div>

                <x-jet-input type="text" class="bg-red-100"
                             wire:model.defer="payment_gateways.{{ $loop->index }}.other_data.second_fee_percentage"/>
            @endif
            <x-primary-button class="mx-auto"> Save
            </x-primary-button>
        </form>
        <br>
        <hr><br>
    @endforeach

</div>
