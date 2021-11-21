<div>
    <div class="py-12">
        <div class="max-w-xl mx-auto px-3 lg:px-8">
            @if($screen_no === 1)
                <h3 class="text-2xl font-semibold text-gray-800">Transfer balance to another UpzarPay Account</h3>

            <form wire:submit.prevent="transfer" id="transferForm" class="mt-6">
                @if($error_msg != '')
                <p class="mb-3 text-red-600 border-2 border-red-300 p-3">
                    {{ $error_msg }}
                </p>
                @endif

                <div class="mb-3">
                    <x-jet-label for="account_id">
                        {{ __('Account ID (funds will be sent to this account)') }}
                    </x-jet-label>
                    <x-jet-input id="account_id" type="text" class="mt-1 block w-full"
                                 wire:model.defer="account_id" placeholder="e.g. 10000000" />
                    <x-jet-input-error for="account_id" class="mt-2"/>
                </div>
                <div class="mb-3">
                    <x-jet-label value="{{ __('Select funds type') }}" for="funds_type"/>
                    <x-select id="funds_type" class="mt-1 block w-full" wire:model.defer="funds_type">
                        <option value="">Select Funds Type</option>
                        @foreach($currencies as $currency)
                            <option value="{{ $currency }}">{{ $currency }} &nbsp;&nbsp;&nbsp;&nbsp; ({{ Auth::user()->balance($currency) }})</option>
                        @endforeach
                    </x-select>

                    <x-jet-input-error for="funds_type" class="mt-2"/>
                </div>

                <div class="mb-3">
                    <x-jet-label value="{{ __('Transfer Amount') }}" for="amount"/>
                    <x-jet-input id="amount" type="text" class="mt-1 block w-full"
                                 wire:model.defer="amount" placeholder="e.g. 1000" />
                    <x-jet-input-error for="amount" class="mt-2"/>
                </div>

                <div class="mb-3">
                    <x-jet-label value="{{ __('Description') }}" for="description"/>
                    <x-jet-input id="description" type="text" class="mt-1 block w-full"
                                 wire:model.defer="description" placeholder="A payment to my employee." />
                    <x-jet-input-error for="description" class="mt-2"/>
                </div>
                <x-jet-button
                    type="submit"
                    class="ml-2" dusk="button" wire:loading.attr="disabled">
                    Transfer
                </x-jet-button>
            </form>
            @elseif($screen_no === 2)
                <h3 class="text-lg font-semibold">Confirm Funds Transfer to account ({{ $account_id }})</h3>
                <hr>
                <form wire:submit.prevent="confirmTransfer" id="confirmTransferForm" class="mt-6">
                    <div class="mb-1">
                        Payment To: <b>{{ $payeeName }}</b>
                    </div>
                    <div class="mb-1">
                        Payment Description: <b>{{ $description }}</b>
                    </div>
                    <div class="mb-1">
                        Amount to be sent: {{ $funds_type }} {{ $amount }}
                    </div>
                    <div class="mb-1">
                        Total Fee: {{ $funds_type }} {{ round($amountToMinus - $amount, 2) }}
                    </div>
                    <div class="mb-8">
                        Debit Amount: <b>{{ $funds_type }} {{ $amountToMinus }}</b>
                    </div>

                    <x-jet-button
                        type="submit"
                        class="ml-2" dusk="button" wire:loading.attr="disabled">
                        Confirm Transfer
                    </x-jet-button>
                </form>

            @elseif($screen_no === 3)
                <section class="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-1/5 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="text-xl font-semibold">Transferred successfully!</h3>
                    <p>{{ "$funds_type $amount has been sent to $account_id ($payeeName)." }}</p>
                    <p>Transaction id: <b>{{ $transaction_id }}</b></p>
                    <br>
                    <x-link :href="route('dashboard.transfer_funds')">Do another transfer</x-link>
                </section>
            @endif
        </div>
    </div>
</div>
