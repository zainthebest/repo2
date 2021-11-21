<?php

namespace App\Http\Livewire\Admin;

use App\Models\PaymentGateway;
use Livewire\Component;

class ManagePaymentGateways extends Component
{
    public $payment_gateways = [];


    protected function getRules()
    {
        return [
            'payment_gateways.*.display_name' => '',
            'payment_gateways.*.payments_to' => '',
            'payment_gateways.*.secret_key' => '',
            'payment_gateways.*.hold_payments_for' => 'int',
            'payment_gateways.*.requires_approval' => '',
            'payment_gateways.*.fee_amount' => function ($attr, $val, $fail) {
                // amount ya to khali ho ya number ho wo bhee accurate
                if (
                    !empty($val) &&
                    !is_numeric($val)
                    || !is_float(floatval($val))
                    || strlen(substr(strrchr($val, "."), 1)) > 8
                ) {
                    $this->emit('notification', 'Invalid amount');
                    $fail('');
                } else if ($val > 1000) {
                    $this->emit('notification', 'Fee amount must be less than or equal to 1,000');
                    $fail('');
                }
            },
            'payment_gateways.*.fee_percentage' => function ($attr, $val, $fail)  {
                // Percentage amount ya to khali ho ya number ho wo bhee accurate
                if (
                    $val !== '' && (
                        !is_numeric($val)
                        || !is_float(floatval($val))
                        || strlen(substr(strrchr($val, "."), 1)) > 2)
                ) {
                    $this->emit('notification', "Invalid percentage amount!{$val}!");
                    $fail('');
                } else if ($val > 1000) {
                    $this->emit('notification', 'Fee amount must be less than or equal to 1,000');
                    $fail('');
                }
            },
            'payment_gateways.*.other_data.second_fee_percentage' => '',
            'payment_gateways.*.other_data.second_fee_amount' => '',
        ];
    }


    public function mount() {
        $this->payment_gateways = PaymentGateway::all();
    }

    public function render()
    {
        return view('admin.manage-payment-gateways');
    }

    public function save($i) {
        // TODO what is missing...
        $this->validate();
        $pg = $this->payment_gateways[$i];
        if ($pg->save()) {
            $this->emit('notification', 'Saved.', 'success');
        } else {
            $this->emit('notification', 'Something went wrong.');
        }


    }
}
