<?php

namespace App\Casts;

use App\Models\PaymentGateway;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Support\Collection;

class UserAllowedPaymentGateways implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return mixed
     */
    public function get($model, $key, $value, $attributes)
    {
        /*
         * Info about database structure
             1. stores.X.approved_payment_gateways:
                An array of payment gateways approved by admin e.g. ['perfect_money':true]
             2. stores.X.user_allowed_pay_gateways:
                An array of payment gateways enabled by the user with the status e.g. {'perfect_money':true, 'payeer':false}
         * Rules
            1. approved_payment_gateways contains ones which are approved by the admin to be used in that particular store

        Casts:
            user_allowed_pay_gateways: loop over all payment gateways add to array:
                1. Add if PG is SET with value of true
                2. Add if PG is not available in the array
            paymentGateways(): Loop over all user_allowed_pay_gateways if the PG is in APPROVED ONES or DOES NOT REQUIRE approval add it to an array which will be returned
         * */


        $set_payment_gateways = json_decode($value, true);

        $total_enabled = [];
        $payment_gateways = PaymentGateway::all();

        // Preparing array of enabled payment gateways ($total_enabled)
        foreach ($payment_gateways as $payment_gateway) {
            $is_set = array_key_exists($payment_gateway->name, $set_payment_gateways);
            // including ones which are NOT SET UP by the user
            if (!$is_set) {
                $total_enabled[$payment_gateway->name] = true;
            }
            // including payment gateways which are SET by the user
            if ($is_set) {
                $total_enabled[$payment_gateway->name] = $set_payment_gateways[$payment_gateway->name];
            }
        }

        return new Collection($total_enabled);
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return mixed
     */
    public function set($model, $key, $value, $attributes)
    {
        $data = json_decode($attributes[$key], true);

        foreach ($value as $key => $val) {
            $data[$key] = $val;
        }

        $toset = json_encode($data);
        return $toset;
    }
}
