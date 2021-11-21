<?php

namespace App\Http\Livewire\Admin;

use App\Models\Currency;
use Livewire\Component;

class ManageCurrencies extends Component
{
    public $currencies = [];

    protected function getRules()
    {
        return [
            'currencies.*.rate' => '',
            'currencies.*.symbol' => '',
        ];
    }


    public function mount() {
        $this->currencies = Currency::all();
    }

    public function save($i) {
        // TODO what is missing...
        $this->validate();
        $pg = $this->currencies[$i];
        if ($pg->save()) {
            $this->emit('notification', 'Saved.', 'success');
        } else {
            $this->emit('notification', 'Something went wrong.');
        }
    }

    public function render()
    {
        return view('admin.manage-currencies');
    }

}
