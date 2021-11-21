<div class="p-2 max-w-7xl m-auto mt-10">
    {{--    TODO agar 1 waqt mai 2 buttons per click kerain to 1 disabled reh jata hy... doosra enable hojata hy --}}
    @foreach($settings as $k => $v)
        <form wire:submit.prevent="update('{{ $k }}')">
            <b class="text-lg capitalize">{{ implode(' ', explode("_", $k)) }}</b>
            <br>
            <div>
                <x-jet-input type="text" wire:model.defer="settings.{{ $k }}" />
                <x-jet-button> Save </x-jet-button>
            </div>
        </form>
        <br>
        <hr><br>
    @endforeach

</div>
