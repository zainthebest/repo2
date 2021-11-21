<div>

    <div class="my-12 max-w-7xl px-6 lg:px-8 mx-auto">
        Total {{ count($withdrawals) }} records
        <br><br>

        @forelse($withdrawals as $wth)
            <div class="flex items-center justify-evenly text-sm font-bold capitalize">
                <div class="flex-1">WID</div>
                <div class="flex-1">User ID</div>
                <div class="flex-1">Amount</div>
                <div class="flex-1">Status</div>
                @foreach($wth->details as $dKey => $dValue)
                    <div class="flex-1">{{ implode(' ', explode('_', $dKey)) }}</div>
                @endforeach
                <div class="flex-1">Date Created</div>
                <div class="flex-1"></div>
            </div>

            <div class="flex items-center justify-evenly py-1">
                <div class="flex-1 capitalize">{{ $wth->id }}</div>
                <div class="flex-1 capitalize "><x-link href="{{ route('admin.users') }}">{{ $wth->payer_id }}</x-link></div>
                <div class="flex-1">{{ "$wth->currency $wth->amount" }}</div>
                <div class="flex-1 capitalize">{{ $wth->status }}</div>
                @foreach($wth->details as $dKey => $dValue)
                    <div class="flex-1">{{ $dValue }}</div>
                @endforeach
                <div class="flex-1">{{ $wth->created_at }}</div>
                <div class="flex-1">
                        @if($wth->status !== 'cancelled')
                            @if($wth->status !== 'completed')
                                <button wire:click="complete('{{ $wth->id }}')" class="px-1 text-green-500">Mark as Completed</button>
                            @endif
                            <button wire:click="cancel('{{ $wth->id }}')" class="px-1 text-red-500">Mark as Cancelled</button>
                        @endif
                </div>
            </div>
            <hr>
            <hr>
            <hr>
        @empty
            <hr>
            <div class="text-center mt-4">
                No withdrawals yet.
            </div>
        @endforelse
    </div>
</div>
