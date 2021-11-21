<?php

namespace App\Http\Livewire\Admin;

use App\Models\PaymentGateway;
use App\Models\Store;
use Livewire\Component;

class StoreSettings extends Component
{
    public $store;
    public $pgs_requiring_approval = [];
    public $approved_ones = [];

    protected array $rules = [
        'approved_ones.*' => 'boolean',
    ];

    public function mount() {
        $this->store = Store::findOrFail($this->store);
        $this->approved_ones = $this->store->approved_payment_gateways;
        $this->pgs_requiring_approval = PaymentGateway::where('requires_approval', 1)->get();
    }

    public function render()
    {
        return view('admin.store-settings');
    }
    public function submit() {
        $this->validate();
        $this->store->approved_payment_gateways = $this->approved_ones;
        $this->store->save();
        $this->emit('notification', 'Settings saved');
    }
}
