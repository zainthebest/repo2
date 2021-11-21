<div>
    <div class="py-12">
        <div class="max-w-xl mx-auto px-3 lg:px-8">
            <h3 class="text-2xl font-semibold">Convert Currency</h3>
            <hr>
            <form x-data="{
                from_currency: '',
                amount:'',
                receiveAmount: 0,
                to_currency: '',
                rates: {{ $rates }},
                calcReceiveAmount: function(v) {
                    if (this.from_currency != '' && this.to_currency !='' && this.amount!='') {
                        // First convert to USDs
                        let units = this.amount / this.rates[this.from_currency];
                        let converted = this.rates[this.to_currency] * units;
                        // Cutting down 1% Fee
                        let num = converted - Math.ceil((converted * {{ \App\Models\Setting::find('currency_converter_fee_percent')->value }} / 100) * 100) / 100;
                        this.receiveAmount = num;
                    } else {
                        this.receiveAmount = 0;
                    }
                }
            }" wire:submit.prevent="convert" id="convertForm" class="mt-6">
                <div class="mb-3">
                    <x-jet-label value="{{ __('Convert from') }}" for="from_currency"/>
                    <x-select id="from_currency" x-model="from_currency" @change="calcReceiveAmount" class="mt-1 block w-full" wire:model.defer="from_currency">
                        <option value="">Select</option>
                        @foreach($currencies as $currency)
                            <option value="{{ $currency }}">{{ $currency }} &nbsp;&nbsp;&nbsp;&nbsp; ({{ Auth::user()->balance($currency) }})</option>
                        @endforeach
                    </x-select>
                    <x-jet-input-error for="from_currency" class="mt-2"/>
                </div>
                <div class="mb-3">
                    <x-jet-label value="{{ __('Convert to') }}" for="to_currency"/>
                    <x-select id="to_currency" x-model="to_currency" @change="calcReceiveAmount" class="mt-1 block w-full" wire:model.defer="to_currency">
                        <option value="">Select</option>
                        @foreach($currencies as $currency)
                            <option value="{{ $currency }}">{{ $currency }} &nbsp;&nbsp;&nbsp;&nbsp; ({{ Auth::user()->balance($currency) }})</option>
                        @endforeach
                    </x-select>
                    <x-jet-input-error for="to_currency" class="mt-2"/>
                </div>
                <div class="mb-3">
                    <x-jet-label value="{{ __('Convert Amount') }}" for="amount"/>
                    <x-jet-input id="amount" x-model="amount" @keyup="calcReceiveAmount" type="text" class="mt-1 block w-full"
                                 wire:model.defer="amount" placeholder="e.g. 1000" />
                    <x-jet-input-error for="amount" class="mt-2"/>
                </div>

                <div class="mb-3 text-sm">
                    You'll receive: <span x-text="to_currency"></span> <span x-text="receiveAmount" ></span>
                </div>

                <x-jet-button
                    type="submit"
                    class="ml-2" dusk="button" wire:loading.attr="disabled">
                    Convert
                </x-jet-button>
            </form>
        </div>
    </div>
</div>
