<?php

namespace App\Http\Livewire\Stores;

use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class DeleteOne extends Component
{
    public $store;


    public function deleteStore() {
        // now going to delete the store from the database
        // TODO is this method secure?
        if ($this->store->softDelete()) {
            $this->emit('notification', 'Store is deleted');
            $this->emit('refreshStoresList');
        } else {
            $this->emit('notification', 'Oops! Something went wrong, please try again later.', 'danger');
        }
    }

    public function render()
    {
        return view('stores.delete-one');
    }
}
