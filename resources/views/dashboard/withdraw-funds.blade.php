<div>
    <x-slot name="header">
        {{ __('Withdraw Funds') }}
    </x-slot>

    <x-slot name="headerMaxWidth">max-w-xl</x-slot>

    <div class="pb-12">
        <div class="max-w-xl mb-6 mx-auto px-3 lg:px-8">
            <form wire:submit.prevent="withdraw" id="withdrawForm">
                <div class="mb-3">
                    <x-jet-label for="bank_country">
                        {{ __('Country name of Bank') }}
                    </x-jet-label>
                    <x-jet-input id="bank_country" type="text" class="mt-1 block w-full"
                                 wire:model.defer="bank_country" placeholder="e.g. America" />
                    <x-jet-input-error for="bank_country" class="mt-2"/>
                </div>
                <div class="mb-3">
                    <x-jet-label for="bank_country">
                        {{ __('Name of the Bank') }}
                    </x-jet-label>
                    <x-jet-input id="bank_name" type="text" class="mt-1 block w-full"
                                 wire:model.defer="bank_name" />
                    <x-jet-input-error for="bank_name" class="mt-2"/>
                </div>
                <div class="mb-3">
                    <x-jet-label value="{{ __('Which funds to withdraw') }}" for="funds_type"/>
                    <x-select id="funds_type" class="mt-1 block w-full" wire:model.defer="funds_type">
                        <option value="">Select Funds Type</option>
                        @foreach($currencies as $currency)
                            <option value="{{ $currency }}">{{ $currency }} &nbsp;&nbsp;&nbsp;&nbsp; ({{ Auth::user()->balance($currency) }})</option>
                        @endforeach
                    </x-select>

                    <x-jet-input-error for="funds_type" class="mt-2"/>
                </div>

                <div class="mb-3">
                    <x-jet-label value="{{ __('Withdraw Amount') }}" for="amount"/>
                    <x-jet-input id="amount" type="text" class="mt-1 block w-full"
                                 wire:model.defer="amount" placeholder="e.g. 1000" />
                    <x-jet-input-error for="amount" class="mt-2"/>
                </div>

                <div class="mb-3">
                    <x-jet-label value="{{ __('Swift code') }}" for="swift_code"/>
                    <x-jet-input id="swift_code" type="text" class="mt-1 block w-full"
                                 wire:model.defer="swift_code" placeholder="" />
                    <x-jet-input-error for="swift_code" class="mt-2"/>
                </div>
                <div class="mb-3">
                    <x-jet-label value="{{ __('IBN') }}" for="ibn"/>
                    <x-jet-input id="ibn" type="text" class="mt-1 block w-full"
                                 wire:model.defer="ibn" placeholder="" />
                    <x-jet-input-error for="ibn" class="mt-2"/>
                </div>

                <x-jet-button
                    type="submit"
                    class="ml-2" dusk="button" wire:loading.attr="disabled">
                    Request Withdraw
                </x-jet-button>
            </form>
        </div>


    </div>
</div>
