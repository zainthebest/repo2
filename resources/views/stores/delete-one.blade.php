<div>
    <x-jet-popup id="modalDeleteStore{{ $store->id }}">
        <!-- Modal > activator -->
        <x-slot name="activator">
            <button
                class="hover:underline text-red-500">Delete
            </button>
        </x-slot>

        {{--    Modal > Content    --}}
        <div class="px-6 py-4">
            <h2 class="text-2xl text-left">Are you sure?</h2>

            <div class="mt-4">
                <p class="text-left">
                    Are you sure you want to delete the "{{ $store->name }}" store? Deleting the store will remove all
                    of the store data from our records.
                </p>
            </div>
        </div>

        {{--    Modal > Footer    --}}
        <div class="px-6 py-4 bg-gray-100">
            <div class="text-left">
                <x-jet-secondary-button
                    @click="show = false"
                    class="ml-2">
                    Cancel
                </x-jet-secondary-button>
                <x-jet-danger-button
                    wire:click="deleteStore"
                    class="ml-2" dusk="button" wire:loading.attr="disabled">
                    Delete Store
                </x-jet-danger-button>

            </div>
        </div>
    </x-jet-popup>

</div>
