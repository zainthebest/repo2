<div>
    <x-slot name="header">
            {{ __('Admin > Manage users') }}
    </x-slot>
    <div class="my-12 max-w-7xl px-6 lg:px-8 mx-auto">
        Total {{ count($users) }} records
        <br><br>
        <div class="flex items-center justify-evenly font-bold">
            <div class="flex-1">#</div>
            <div class="flex-1">Name</div>
            <div class="flex-1">Docs Verified at</div>
            <div class="flex-1">Registered at</div>
            <div class="flex-1"></div>
        </div>
        @forelse($users as $user)
            <hr>
            <div class="flex items-center justify-evenly">
                <div class="flex-1">{{ $user->id }}</div>
                <div class="flex-1">{{ $user->name }}</div>
                <div class="flex-1">{{ is_null($user->docs_verified_at) ? 'Unverified' : $user->docs_verified_at }}</div>

                <div class="flex-1">{{ $user->created_at }}</div>
                <div class="flex-1">
                    <button wire:click="toggleDocsVerified({{ $user->id }})" class="text-blue-600 hover:underline">
                        {{ $user->docs_verified_at ? 'Mark as unverified': 'Mark as verified' }}
                    </button>
                </div>
            </div>
        @empty
            <hr>
            <div class="text-center mt-4">
                There are mo users registered.
            </div>
        @endforelse
    </div>
</div>
