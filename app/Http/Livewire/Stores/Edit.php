<?php

namespace App\Http\Livewire\Stores;

use App\Models\PaymentGateway;
use App\Models\Store;
use App\Rules\StoreName;
use Livewire\Component;

class Edit extends Component
{
    public $store;
    public $msg = '';
    public $user_allowed_pay_gateways_new = [];

///   TODO Error should be nice looking. if user submits some value for $store.created_at
///
///
    protected function getRules()
    {
        return [
            'store.name' => new StoreName,
            // TODO store name may also contain spaces...
            // TODO some other validations also needed here
            'store.website_url' => 'required|url',
            // TODO Must check the website url from user input is not being saved...
            'store.success_url' => 'required|url',
            'store.fail_url' => 'required|url',
            'store.callback_url' => 'required|url',
            'store.secret_key' => 'nullable|max:100',
            // TODO add additional validation to secret key
            'store.fee_payer' => 'required|in:payer,payee,both',
            'user_allowed_pay_gateways_new' => 'array'
        ];
    }


    public function mount($store) {
        // finding given id in the stores of logged in user...
        // TODO Check security here
        $this->store = auth()->user()->stores()->findOrFail($store);

        $this->user_allowed_pay_gateways_new = $this->store->user_allowed_pay_gateways;

        // TODO get limited data above
    }

    public function submitForm() {
        $this->validate();
        $this->store->user_allowed_pay_gateways = $this->user_allowed_pay_gateways_new;
        if ($this->store->secret_key == '') {
            unset($this->store->secret_key);
        }
        if ($this->store->save()) {
            $this->store->secret_key = '';
            $this->emit('notification', 'Saved.', 'success');
        } else {
            $this->emit('notification', 'Something went wrong, please try again later..', 'danger');
        }
    }



    public function render()
    {
        return view('stores.edit');
    }
}
