<?php

namespace App\Http\Livewire\Stores;

use App\Rules\StoreName;
use Livewire\Component;

class Add extends Component
{
    public $showModal = false;

    public $storeName;
    public $domainName;
    public $successURL;
    public $failURL;
    public $callbackURL;

    // TODO: validate user input
    // ye check karna hy k user url wali fields mai sahi url daly
    public function submitForm() {
        $this->validate([
            // TODO store name mai spaces bhee aa sakti hain...
            'storeName' => new StoreName(),
            'domainName' => 'required|url',
            'successURL' => 'required|url',
            'failURL' => 'required|url',
            'callbackURL' => 'required|url'
        ]);

        // Continue if the validation is successful...
        // persist the store to the database

        auth()->user()->stores()->create([
            'name' => $this->storeName,
            'website_url' => $this->domainName,
            'success_url' => $this->successURL,
            'fail_url' => $this->failURL,
            'callback_url' => $this->callbackURL,
        ]);
        $this->clearForm();

        $this->emit('refreshStoresList');
        $this->emit('notification', 'Store added!', 'success');
        // TODO check if something is missed here
    }


    public function render()
    {
        return view('stores.add');
    }


    public function clearForm() {
        $this->storeName = null;
        $this->domainName = null;
        $this->successURL = null;
        $this->failURL = null;
        $this->callbackURL = null;
    }
}
