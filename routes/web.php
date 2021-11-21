<?php

use App\Jobs\ClearPendingFunds;
use App\Jobs\ProcessPodcast;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\File;
// TODO: Remove cache expire from .env
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('logs', function (\Illuminate\Http\Request $request) {
    $file_path = storage_path('logs/laravel.log');

    if ($request->exists('clear')) {
        file_put_contents($file_path, '');
        header('location: logs');
    }

    echo '<a href="logs?clear">Clear</a> - - - <a href="logs">Log</a>';
    dd(file_get_contents($file_path));
});

Route::get('/newjob', function () {
    ClearPendingFunds::dispatch(123)->delay(now()->addSeconds(3));
});

Route::any('/', function () {
    return view('welcome');
})->name('landing_page');

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::any('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
    Route::any('/dashboard/transfer-funds', App\Http\Livewire\Dashboard\TransferFunds::class)
        ->name('dashboard.transfer_funds');
    Route::any('/dashboard/convert-currency', App\Http\Livewire\Dashboard\ConvertCurrency::class)
        ->name('dashboard.convert_currency');
    Route::any('/dashboard/withdraw-funds', App\Http\Livewire\Dashboard\WithdrawFunds::class)
            ->name('dashboard.withdraw_funds');

    Route::any('/my-stores', App\Http\Livewire\Stores\Index::class)->name('stores.index');
    Route::any('/my-stores/{store}/settings', App\Http\Livewire\Stores\Edit::class)->name('stores.edit');

    Route::any('/invoices/{invoice}/pay', App\Http\Livewire\Invoice\PayWithFunds::class)->name('invoice.pay_with_funds');
    Route::any('/dashboard/transactions', App\Http\Livewire\Dashboard\Transactions::class)->name('dashboard.transactions');
});

Route::any('/invoices/{zinvoice}', \App\Http\Livewire\Invoice\Show::class)->name('invoice.show');

// Khata app
Route::get('/khata', \App\Http\Livewire\Khata\Welcome::class)->name('khata.welcome');
Route::get('/khata/{date}', \App\Http\Livewire\Khata\View::class)->name('khata.show');

Route::get('/artisan/refresh', function () {
    return "<pre>".shell_exec('cd ../SOURCE.pay.upzar.com/ && php artisan migrate:fresh && php artisan db:seed')."</pre>";
});
Route::get('/artisan/listen', function () {
    return "<pre>".shell_exec('cd ../SOURCE.pay.upzar.com/ && php artisan queue:listen')."</pre>";
});
