<?php

namespace Database\Seeders;

use App\Models\PaymentGateway;
use Illuminate\Database\Seeder;

class PaymentGatewaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        PaymentGateway::firstOrCreate([
            'name' => 'perfect_money',
            'display_name' => 'Perfect Money',
            'hold_payments_for' => 30,
            'requires_approval' => false,
            'payments_to' => 'U17300932',
            'secret_key' => 'rr92JubzAr6Cf94KKGmchIZNk'
        ]);
        PaymentGateway::firstOrCreate([
            'name' => 'payeer',
            'display_name' => 'Payeer',
            'requires_approval' => false,
            'hold_payments_for' => 30,
            'payments_to' => '1350244808',
            'secret_key' => '2mizbLFRR3jf@2v'
        ]);
        PaymentGateway::firstOrCreate([
            'name' => 'blockchain_btc',
            'display_name' => 'Bitcoin via Blockchain',
            'requires_approval' => true,
            'hold_payments_for' => 30,
            'payments_to' => 'xpub6CsPLodvde4St6uHyDZKJEgtNCnEWo1qQJhyAfijeoQN1GrcrjTMbTuFSZkNtooVpdK2qUhnbgZVgSsgAcUWsHmiYVEJquB8Gz2Cxo1P7hX',
            'secret_key' => 'kjihih6768787nknknkn'
        ]);
        \App\Models\PaymentGateway::firstOrCreate([
            'name' => 'alfalah',
            'display_name' => 'Credit/Debit Card',
            'requires_approval' => false,
            'hold_payments_for' => 30,
            'payments_to' => '3427',
            'other_data' => [
                'store_id' => '012170',
                'key1' => 'haqp8aRvp9YwbP5u',
                'key2' => '6985039530655068',
                'store_name' => 'USMAN ONLINE SERVICES',
                'merchant_name' => 'USMAN ONLINE SERVICES',
                'merchant_hash' => 'OUU362MB1ur5v1orWzXlHBAR73/LBY5jBN98EdVGB3mz7613htCdvLkIzzNozr1e',
                'merchant_username' => 'lavanu',
                'merchant_password' => 'oHU8IadMnXBvFzk4yqF7CA==',
            ],
            'secret_key' => 'kjihih6768787nknknkn'
        ]);
        \App\Models\PaymentGateway::firstOrCreate([
            'name' => 'jazzcash',
            'display_name' => 'JazzCash',
            'requires_approval' => false,
            'hold_payments_for' => 30,
            'payments_to' => '',
            'secret_key' => ''
        ]);
        \App\Models\PaymentGateway::firstOrCreate([
            'name' => 'easypaisa',
            'display_name' => 'Easypaisa',
            'requires_approval' => false,
            'hold_payments_for' => 30,
            'payments_to' => '64109',
            'secret_key' => ''
        ]);
        \App\Models\PaymentGateway::firstOrCreate([
            'name' => 'paypal',
            'display_name' => 'PayPal',
            'requires_approval' => false,
            'hold_payments_for' => 30,
            'payments_to' => 'sb-bmuy435787401@business.example.com',
            'secret_key' => ''
        ]);
        \App\Models\PaymentGateway::firstOrCreate([
            'name' => 'internal_transfer',
            'display_name' => 'Transfer funds',
            'requires_approval' => false,
            'hold_payments_for' => 30,
            'payments_to' => 'UpzarPay user',
            'secret_key' => '',
            'other_data' => [
                'second_fee_amount' => 0,
                'second_fee_percentage' => 0
            ]
        ]);
    }
}
