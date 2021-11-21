<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
| .
*/

// Admin routes...
Route::middleware(['auth:sanctum', 'verified', 'role:admin'])->group(function () {
    Route::get('/', \App\Http\Livewire\Admin\Welcome::class)->name('admin.welcome');
    Route::get('/manage-payment-gateways', \App\Http\Livewire\Admin\ManagePaymentGateways::class)->name('admin.managePaymentGateways');

    Route::get('/currencies', \App\Http\Livewire\Admin\ManageCurrencies::class)->name('admin.manageCurrencies');
    Route::get('/users', \App\Http\Livewire\Admin\Users::class)->name('admin.users');
    Route::get('/settings', \App\Http\Livewire\Admin\Settings::class)->name('admin.settings');
    Route::get('/manage-payments', \App\Http\Livewire\Admin\ManagePayments::class)->name('admin.managePayments');
    Route::get('/manage-withdrawals', \App\Http\Livewire\Admin\ManageWithdrawals::class)->name('admin.manageWithdrawals');
    Route::get('/stores/{store}/settings', \App\Http\Livewire\Admin\StoreSettings::class)->name('admin.store_settings');
});
