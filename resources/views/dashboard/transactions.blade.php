<div>
    {{-- To attain knowledge, add things every day; To attain wisdom, subtract things every day --}}
    <x-slot name="header">
        {{ __('Transactions') }}
    </x-slot>

    <style>
        .mainTable {
            grid-template-columns: repeat(4, auto);
        }
        @media (min-width: 1024px) {
            .mainTable {
                grid-template-columns: repeat(7, minmax(0, auto));
            }
        }
    </style>
    <div class="max-w-7xl px-5 lg:px-7 mx-auto">
        Total {{ count($transactions) }} records
    </div>
    <br>
    <div class="mb-12 max-w-7xl px-5 lg:px-7 mx-auto">
        <div class="grid mainTable overflow-auto bg-white shadow-md text-gray-800 whitespace-nowrap"
             x-data="{selected:null}"
        >
            <b class="p-2 bg-gray-50 font-semibold">Transaction Id</b>
            <b class="p-2 bg-gray-50 font-semibold">Amount</b>
            <b class="p-2 bg-gray-50 font-semibold hidden lg:block">Fee</b>
            <b class="p-2 bg-gray-50 font-semibold hidden lg:block whitespace-normal">Description</b>
            <b class="p-2 bg-gray-50 font-semibold">Status</b>
            <b class="p-2 bg-gray-50 font-semibold hidden lg:block">Date</b>
            <b class="p-2 bg-gray-50 font-semibold hidden lg:block">Release Date</b>
            <b class="lg:hidden p-2 bg-gray-50"></b>
        @forelse($transactions as $transaction)
            <div class="p-2">{{ $transaction->id }}</div>
            <div class="p-2">
                @if(auth()->id() == $transaction->payer_id)
                    <div class="text-red-600">-{{ "$transaction->currency $transaction->amount" }}</div>
                @endif
                @if(auth()->id() == $transaction->payee_id)
                    <div class="text-green-600">+{{ "$transaction->currency $transaction->amount" }}</div>
                @endif
                @if($transaction->payment_gateway == 'currency_convert')
                        <div class="text-green-600">+{{ $transaction->details['to_currency'].' '.$transaction->details['to_amount'] }}</div>
                @endif

            </div>
            <div class="p-2 hidden lg:block">
                @if(auth()->id() == $transaction->payer_id || (auth()->id() == $transaction->payer_id && auth()->id() == $transaction->payee_id))
                    {{ "$transaction->currency ".$transaction->fee_for_payer }}
                @else
                    {{ "$transaction->currency $transaction->fee_for_payee" }}
                @endif
            </div>

            <div class="p-2 hidden lg:block whitespace-normal">
                    {{ $transaction->description }}
            </div>
            <div class="p-2">
                @php
                    $statusMeanings = [
                        'disputed' => 'dispute',
                        'on_hold' => 'pending'
                    ];
                @endphp
                {{ isset($statusMeanings[$transaction->status]) ? $statusMeanings[$transaction->status] : $transaction->status }}
            </div>
                <div class="p-2 hidden lg:block">{{ $transaction->created_at }}</div>
            <div class="p-2 hidden lg:block">{{ $transaction->available_on }}</div>

            <div class="flex lg:hidden justify-center gap-1 p-2">
                <a href="javascript:void(0)" @click="selected = selected == {{$loop->index}}?null:{{$loop->index}}"
                   class=" text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hover:bg-gray-100 rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                </a>
            </div>

            <div
                style="overflow: hidden"
                class="col-span-full flex flex-col transition-all duration-1000 max-h-0 whitespace-normal"
                x-bind:style="selected !== {{$loop->index}} ? 'overflow: hidden;max-height:0;' : 'box-shadow: 1px 4px 14px 2px #eee;max-height:'+$el.offsetHeight+'px;overflow: hidden;'">
                <div class="grid px-5 py-2" style="grid-template-columns: 1fr 2fr">
                    <b>Fee</b> <div>
                        @if(auth()->id() == $transaction->payer_id || (auth()->id() == $transaction->payer_id && auth()->id() == $transaction->payee_id))
                            {{ "$transaction->currency ".$transaction->fee_for_payer }}
                        @else
                            {{ "$transaction->currency $transaction->fee_for_payee" }}
                        @endif
                    </div>
                    <b>Description</b> <div>{{ $transaction->description }}</div>
                    <b>Date</b> <div>{{ $transaction->created_at }}</div>
                    <b>Release date</b> <div>{{ $transaction->available_on }}</div>
                </div>
            </div>
        @empty
                <hr style="grid-column-start: 1;grid-column-end: 8;">
            <div class="text-center mt-4">
                You do not have any transactions yet. <br>Make any transactions to see them here.
            </div>
        @endforelse
        </div>
    </div>
</div>
