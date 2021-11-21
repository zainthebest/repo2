<div>
    <x-slot name="header">
{{--        <h2 class="font-semibold text-xl text-gray-800 leading-tight">--}}
            <span class="text-gray-500">{{ __('Manage store') }}</span>
            /
            <span>Store settings</span>
{{--        </h2>--}}
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl flex flex-col mx-auto px-3 lg:px-8">
            <div class="text-gray-500">

                <form wire:submit.prevent="submit">
                    <div class="mb-3">
                        <x-jet-label value="{{ __('Store Name') }}" for="storeName"/>
                        <x-jet-input id="storeName" type="text" class="mt-1 block w-full"
                                     value="{{ $store->name }}" disabled />
                    </div>
                    <div class="mb-3">
                        <x-jet-label value="{{ __('Approve payment methods') }}"/>
                        <div>
                             @foreach($this->pgs_requiring_approval as $pg)
                                <x-jet-label class="border-4  mt-0 inline-flex px-1 py-1 items-center">
                                    <x-jet-checkbox wire:model.defer="approved_ones.{{ $pg->name }}" />
                                    <span class="ml-2 text-sm text-gray-600">{{ $pg->display_name }}</span>
                                </x-jet-label>
                            @endforeach
                        </div>

                        <x-jet-input-error for="store.user_allowed_pay_gateways" class="mt-2"/>
                    </div>



                    <x-jet-secondary-link
                        href="{{ route('admin.welcome') }}"
                        class="ml-2">
                        Back
                    </x-jet-secondary-link>
                    <x-jet-button
                        type="submit"
                        class="ml-2" dusk="button" wire:loading.attr="disabled">
                        Save settings
                    </x-jet-button>
                </form>
            </div>
        </div>
    </div>
</div>
