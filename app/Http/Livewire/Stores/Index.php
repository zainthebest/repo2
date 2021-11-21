<?php

namespace App\Http\Livewire\Stores;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Livewire\Component;

class Index extends Component
{
    public $stores = [];

    protected $listeners = [
        'refreshStoresList' => 'refreshStores'
    ];

    public function prepareStoresList() {
        $this->stores = Auth::user()->stores;
    }


    public function mount() {
        $this->prepareStoresList();
    }

    public function render()
    {
        return view('stores.index');
    }

    public function refreshStores() {
        $this->redirect(route('stores.index'));
    }
}
