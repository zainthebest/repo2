<div>
    <x-slot name="header">
        {{ __('Manage your stores') }}
    </x-slot>
    <x-slot name="headerMaxWidth">max-w-5xl</x-slot>
    <div class="pb-12">
        <div class="max-w-5xl flex flex-col mx-auto px-3 lg:px-8">
            <livewire:stores.add :key="microtime()" />
            <br>
            <div class="text-gray-500">
                @if(count($stores))
                    <div class="bg-white shadow-xl">
                        <style>
                            .mainTable {
                                grid-template-columns: repeat(3, minmax(0, 1fr));
                            }
                            .mainTable .p-2 {
                                overflow: hidden;
                                word-break: keep-all;
                                text-overflow: ellipsis;
                            }
                            @media (min-width: 1024px) {
                                .mainTable {
                                    grid-template-columns: repeat(4, minmax(0, auto));
                                }
                            }
                        </style>
                        <div
                            class="grid mainTable text-center "
                            x-data="{selected:null}"
{{--                            style="white-space: nowrap;"--}}
                        >
                            <div class="p-2 bg-gray-50 uppercase font-bold text-gray-500">Store Id</div>
                            <div class="p-2 bg-gray-50 uppercase font-bold text-gray-500 hidden lg:block">Store name</div>
                            <div class="p-2 bg-gray-50 uppercase font-bold text-gray-500">Website</div>
{{--                            <div class="p-2 bg-gray-50 uppercase font-bold text-gray-500">Created at</div>--}}
                            <div class="p-2 bg-gray-50 uppercase font-bold text-gray-500">
                                Actions
                            </div>
                        @foreach($stores as $store)
                                <div class="p-2" wire:dirty.class="bg-red-500">{{ $store->id }}</div>
                                <div class="p-2 hidden lg:block">{{ $store->name }}</div>
                                <div class="p-2">{{ $store->website_url }}</div>
{{--                                <div class="p-2">{{ $store->created_at }}</div>--}}
                                <div class="flex lg:hidden justify-center gap-1 p-2">
                                    <a href="javascript:void(0)" @click="selected = selected == {{$loop->index}}?null:{{$loop->index}}"
                                        class=" text-blue-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hover:bg-gray-100 rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                        </svg>
                                    </a>
                                </div>
                                <div class="hidden lg:flex justify-center gap-1 p-2 ">
                                    <a
                                        class="hover:underline text-blue-500"
                                        href="{{ route('stores.edit', [$store->id]) }}">Settings</a>
{{--                                    |--}}
{{--                                    <livewire:stores.delete-one :store="$store" :key="$store->id" />--}}
                                    |
                                    <livewire:stores.create-invoice :store="$store" :key="'i2'.$store->id" />

                                </div>
                                <div
                                    style="overflow: hidden"
                                    class="col-span-full flex flex-col transition-all duration-500 max-h-0" x-bind:style="selected !== {{$loop->index}} ? 'overflow: hidden;max-height:0;' : 'box-shadow: 1px 4px 14px 2px #eee;max-height:'+'200'+'px;overflow: hidden;'">
                                    <div class="flex flex-col">
                                        <b class="text-gray-500">STORE NAME</b> {{ $store->name }}
                                    </div>
                                    <div class="flex justify-center gap-2 p-2">
                                        <a
                                            class="hover:underline text-blue-500"
                                            href="{{ route('stores.edit', [$store->id]) }}">Settings</a>
                                        <livewire:stores.delete-one :store="$store" :key="'i2'.$store->id" />
                                        <livewire:stores.create-invoice :store="$store" :key="'i2'.$store->id" />

                                    </div>
                                </div>
                            @endforeach
                            </div>
                    </div>
                @else
                    You've not added any store yet
                @endif
            </div>
        </div>
    </div>
</div>
