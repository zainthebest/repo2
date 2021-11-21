<?php

namespace App\Http\Livewire\Admin;

use Livewire\Component;

class Welcome extends Component
{
    public $store_id;


    public function openStoreSettings() {
        return $this->redirect(route('admin.store_settings', $this->store_id));
    }

    public function render()
    {
        return view('admin.welcome');
    }
}
