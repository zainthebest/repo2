<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            PaymentGatewaySeeder::class
        ]);

        // creating a user account and then a store associated with the user
        $user = User::create([
            'name' => 'Test 1',
            'email' => 'test1@gmail.com',
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            'email_verified_at' => '2021-01-01 00:00:01',
            'is_admin' => 1,
            'remember_token' => Str::random(10)
        ]);
        $user2 = User::create([
            'name' => 'Test 2',
            'email' => 'test2@gmail.com',
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            'email_verified_at' => '2021-01-01 00:00:01',
            'remember_token' => Str::random(10)
        ]);
        $store = $user->stores()->create([
            'name' => 'Test Store',
            'website_url' => 'https://abc.com',
            'success_url' => 'https://abc.com/api/success_url',
            'fail_url' => 'https://abc.com/api/fail_url',
            'callback_url' => 'https://abc.com/api/callback_url',
        ]);

        // \App\Models\User::factory(10)->create();
    }
}
