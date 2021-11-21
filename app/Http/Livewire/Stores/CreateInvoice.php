<?php

namespace App\Http\Livewire\Stores;

use App\Models\Currency;
use App\Models\Invoice;
use App\Models\Store;
use App\Rules\Max2Decimals;
use Illuminate\Support\Facades\Log;
use Livewire\Component;
use App\Models\PaymentGateway;

class CreateInvoice extends Component
{

    public Store $store;
    public int $eId;
    public $response_html;
    public array $invoice = [
        'currency_code' => 'USD'
    ];
    public $currencies = [];

    public function render()
    {
        return view('stores.create-invoice');
    }

    public function mount()
    {
        $this->eId = rand(10000000,99999999);
        $this->currencies = Currency::all()->pluck('id');
    }

    public function save()
    {
        // TODO needs additional validations
        // TODO beautify errors message
        $data = $this->validate([
            // TODO see if more validations are needed here
            'invoice.amount' => ['required', new Max2Decimals()],
            'invoice.order_id' => '',
            'invoice.currency_code' => 'required',
            'invoice.description' => '',
        ]);
        // TODO order id validation if is not null...
        // TODO validations oopar jo hyn un ko theek set karna hy...


//        TODO: can store be added when the user login session has expired?

        $inv = $this->store->generateInvoice($data['invoice']);

        if (!$inv) {
            Log::error('Invoice create ni ho rahi', $data);
            $this->emit('notification', 'Oops! Something went wrong, please try again later.');
            return;
        }

        $this->invoice = [
            'currency_code' => 'USD'
        ];

        $this->emitSelf('closePopup');
        $url = route('invoice.show', $inv->token);

        $this->response_html = <<<TAG
                <div class="text-gray-400 border-2 border-blue-200 px-3 py-3 mb-3">
                    Invoice created
                    <a href="$url" target="_blank" class="text-blue-400 hover:underline">
                        (view invoice)
                    </a>
                </div>
TAG;
        $this->emit('notification', 'Invoice created');


    }
}
