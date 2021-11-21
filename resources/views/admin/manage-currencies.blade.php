<div class="p-2 max-w-7xl m-auto mt-10">
    {{--    TODO agar 1 waqt mai 2 buttons per click kerain to 1 disabled reh jata hy... doosra enable hojata hy --}}

    @foreach($currencies as $currency)
        <form wire:submit.prevent="save({{ $loop->index }})">
            <b class="text-lg">{{ $currency->id }}</b>
            <br>
            <div>
                Rate
                <x-jet-input type="text" wire:model.defer="currencies.{{ $loop->index }}.rate" />
            </div>
            <div>
                Symbol
                <x-jet-input type="text" wire:model.defer="currencies.{{ $loop->index }}.symbol" />
            </div>
            <x-jet-button> Save </x-jet-button>
        </form>
        <br>
        <hr><br>
    @endforeach

</div>
