<div class="bg-purple-100 p-2 container m-auto mt-10">

    Store settings by store id <br>
    <form wire:submit.prevent="openStoreSettings">
        <x-jet-input wire:model.defer="store_id" />
        <button>Go</button>
    </form>
</div>*
