<div>
    <div class="my-12 max-w-7xl px-6 lg:px-8 mx-auto">
        Total {{ count($payments) }} records
        <br><br>

        <hr>
        <div class="flex items-center justify-evenly font-bold">
            <div class="flex-1">#</div>
            <div class="flex-1">Amount</div>
            <div class="flex-1">Release date</div>
            <div class="flex-1">Status</div>
            <div class="flex-1">Payment method</div>
            <div class="flex-1">Actions</div>
        </div>

        @forelse($payments as $pmnt)
            <div class="flex items-center justify-evenly py-1">
                <div class="flex-1">{{ $pmnt->id }}</div>
                <div class="flex-1">{{ "$pmnt->currency $pmnt->amount" }}</div>
                <div class="flex-1">{{ $pmnt->available_on }}</div>
                <div class="flex-1">{{ $pmnt->status }}</div>
                <div class="flex-1">{{ $pmnt->payment_gateway }}</div>
                <div class="flex-1">
                    @if($pmnt->status === 'disputed')
                        <button wire:click="removeDispute({{ $pmnt->id }})" class="px-1 bg-indigo-100 text-indigo-500">Remove Dispute</button>
                        <button wire:click="markAsCancelled({{ $pmnt->id }})" class="px-1 bg-gray-200 text-gray-500">Mark as Cancelled</button>
                    @elseif($pmnt->status !== 'cancelled' && $pmnt->payment_gateway !=='internal_transfer')
                        <button wire:click="markDispute({{ $pmnt->id }})" class="px-1 bg-red-100 text-red-600">Mark as Disputed</button>
                    @endif
                </div>
            </div>
            <hr>
            <hr>
            <hr>
        @empty
            <hr>
            <div class="text-center mt-4">
                No payments yet.
            </div>
        @endforelse
    </div>
</div>