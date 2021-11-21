<div class="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
    {{-- Success is as dangerous as failure. --}}


    <div>
        <x-link href="{{ route('khata.welcome') }}">
            < Go back.
        </x-link>
    </div>

    <h3 class="text-md mb-7 w-90 -mt-52">
        <span>
            Showing khata of {{ $date }}
        </span>
    </h3>

    <div class="border-2 bg-white px-4 py-3">
        <h1 class="text-center text-2xl mb-5 font-semibold leading-tight">
            CASH IN
        </h1>
        <table class="table-fixed">
            <thead>
            <tr class="border-b-2 text-gray-500">
                <th class="px-4">CATEGORY</th>
                <th class="px-4">AMOUNT</th>
                <th class="px-4">DESCRIPTION</th>
                <th class="px-4">Actions</th>
            </tr>
            </thead>
            <tbody>
                @forelse($transactions as $trx)
                <tr class="border-b-2">
                    <td class="px-4">{{ $trx->category->name }}</td>
                    <td class="px-4">{{ $trx->amount }}</td>
                    <td class="px-4">
                        {{ $trx->description }}
                    </td>
                    <td class="px-4">
                        <x-link>Edit</x-link>
                    </td>
                </tr>
                @empty
                    <tr class="border-b-2">
                        <td class="px-4 py-3 text-center text-gray-500" colspan="4">
                            There are not any records added yet.
                        </td>
                    </tr>
                @endforelse
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="5" class="py-3">
                        <x-jet-popup id="popup_for_new_in">
                            <x-slot name="activator">
                                <button closeOnOutsideClick="1"
                                    class="bg-green-600 shadow-md text-white py-1 px-3 inline-block mx-auto">Add a new CASH IN record</button>
                            </x-slot>


                            {{--    Modal Content    --}}
                            <div class="px-6 py-4">
                                <div class="text-2xl">
                                    Add a new CASH IN record
                                </div>

                                <div class="mt-4">
                                    <form wire:submit.prevent="newCashInRecord" id="form1">

                                        <div class="mb-3">
                                            <x-jet-label value="{{ __('Category') }}"/>

                                            <x-select
                                                class="mt-1 block w-full"
                                                wire:model.defer="record.category_id">
                                                <option value="">Select a category</option>
                                                @foreach($categories->where('type', 'for_IN') as $cat)
                                                    <option value="{{ $cat->id }}">{{ $cat->name }}</option>
                                                @endforeach
                                            </x-select>

                                            <x-jet-input-error for="record.category_id" class="mt-2"/>
                                        </div>


                                        <div class="mb-3">
                                            <x-jet-label value="{{ __('Amount') }}" for="amount"/>
                                            <x-jet-input id="amount" type="number" class="mt-1 block w-full" wire:model.defer="record.amount"
                                                autocomplete="disabled" />
                                            <x-jet-input-error for="record.amount" class="mt-2"/>
                                        </div>
                                        <div class="mb-3">
                                            <x-jet-label value="{{ __('Description') }}" for="description"/>
                                            <x-jet-input id="description" type="text" class="mt-1 block w-full" wire:model.defer="record.description"/>
                                            <x-jet-input-error for="record.description" class="mt-2"/>
                                        </div>

                                    </form>
                                </div>
                            </div>

                            {{--    Modal Footer    --}}
                            <div class="px-6 py-4 bg-gray-100">
                                <x-jet-secondary-button
                                    @click="show = false"
                                    class="ml-2">
                                    Cancel
                                </x-jet-secondary-button>
                                <x-jet-button
                                    form="form1" type="submit"
                                    class="ml-2" dusk="button" wire:loading.attr="disabled">
                                    Save record
                                </x-jet-button>
                            </div>
                        </x-jet-popup>
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</div>
