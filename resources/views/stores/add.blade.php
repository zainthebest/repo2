<div>
    <x-jet-popup id="modalAddNewStore" closeOnOutsideClick="0">
        <!-- Modal > activator -->
        <x-slot name="activator">
            <button
                class="bg-blue-400 rounded font-semibold uppercase py-2 px-3 text-white shadow-md">
                Add a new store
            </button>
        </x-slot>

        {{--    Modal > Content    --}}
        <div class="px-6 py-4">
            <div class="text-2xl">
                Add a new store
            </div>

            <div class="mt-4">
                <form wire:submit.prevent="submitForm" id="addStoreForm">
                    <div class="mb-3">
                        <x-jet-label value="{{ __('Store Name') }}" for="storeName"/>
                        <x-jet-input id="storeName" type="text" class="mt-1 block w-full" wire:model.defer="storeName"/>
                        <x-jet-input-error for="storeName" class="mt-2"/>
                    </div>

                    <div class="mb-3">
                        <x-jet-label value="{{ __('Website URL e.g. http://example.com') }}" for="aa"/>
                        <x-jet-input id="domainName" type="text" class="mt-1 block w-full" wire:model.defer="domainName"/>
                        <x-jet-input-error for="domainName" class="mt-2"/>
                    </div>

                    <div class="mb-3">
                        <x-jet-label value="{{ __('Success URL') }}" for="aa"/>
                        <x-jet-input id="successURL" type="text" class="mt-1 block w-full" wire:model.defer="successURL"/>
                        <x-jet-input-error for="successURL" class="mt-2"/>
                    </div>

                    <div class="mb-3">
                        <x-jet-label value="{{ __('Fail URL') }}" for="aa"/>
                        <x-jet-input id="failURL" type="text" class="mt-1 block w-full" wire:model.defer="failURL"/>
                        <x-jet-input-error for="failURL" class="mt-2"/>
                    </div>

                    <div class="mb-3">
                        <x-jet-label value="{{ __('Callback/Status URL') }}" for="aa"/>
                        <x-jet-input id="callbackURL" type="text" class="mt-1 block w-full" wire:model.defer="callbackURL"/>
                        <x-jet-input-error for="callbackURL" class="mt-2"/>
                    </div>
                </form>
            </div>
        </div>

        {{--    Modal > Footer    --}}
        <div class="px-6 py-4 bg-gray-100">
            <x-jet-secondary-button
                @click="show = false"
                class="ml-2">
                Cancel
            </x-jet-secondary-button>
            <x-jet-button
                form="addStoreForm" type="submit"
                class="ml-2" dusk="button" wire:loading.attr="disabled">
                Add Store
            </x-jet-button>
        </div>
    </x-jet-popup>

</div>
