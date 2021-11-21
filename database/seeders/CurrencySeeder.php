<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \App\Models\Currency::create([
            'id' => 'USD',
            'rate' => 1,
            'symbol' => '$'
        ]);\App\Models\Currency::create([
            'id' => 'PKR',
            'rate' => 100,
            'symbol' => 'PKR'
        ]);\App\Models\Currency::create([
            'id' => 'EUR',
            'rate' => 78,
            'symbol' => 'EUR'
        ]);\App\Models\Currency::create([
            'id' => 'ARS',
            'rate' => 78,
            'symbol' => 'ARS'
        ]);
    }
}
