<div class="min-h-screen flex flex-col items-center">
    <h1 class="text-3xl mt-3 md:mt-28">Confirm your payment
        <hr></h1>
    <br>

    <div class="grid grid-flow-row grid-cols-2 gap-x-6 gap-y-4">
        <b>Invoice Id</b>
        <span>{{ $invoice->token }} ({{ $invoice->status }})</span>
        <b>Merchant:</b>
        <span>{{ $invoice->store->name }}</span>
        <b>Invoice amount</b>
        <span>{{ $invoice->currency_code }} {{ $invoice->amount }}</span>
        <b>Fees</b>
        <span>{{ $invoice->currency_code }} {{ $fees }}</span>
        <b>Total</b>
        <span>{{ $invoice->currency_code }} {{ $totalAmount }}</span>
    </div>
    <div class="mt-7">
        Select account to pay from
        <x-select class="w-full block cursor-not-allowed" disabled>
            <option>{{ $invoice->currency_code }} ({{ Auth::user()->balance($invoice->currency_code) }})</option>
        </x-select>
        <form wire:submit.prevent="confirmed">
            <button class="bg-blue-500 shadow-sm text-white py-1 font-bold px-3 mt-5" type="submit" dusk="button" wire:loading.attr="disabled">
                Confirm payment using account balance
            </button>
        </form>
    </div>
</div>
