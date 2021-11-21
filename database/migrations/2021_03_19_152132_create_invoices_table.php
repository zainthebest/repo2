<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInvoicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')
                ->references('id')
                ->on('stores');
            $table->string('token')->nullable();
            $table->unique('token');
            $table->unsignedFloat('amount');
            $table->unsignedFloat('amount_in_btc', 0, 20);
            $table->string('btc_address')->nullable();
            // TODO maybe change amount_in_btc type
            $table->enum('status', ['unpaid', 'paid', 'payment_detected'])->default('unpaid');
            $table->enum('fee_payer', ['both', 'payer', 'payee']);
            $table->string('order_id')->nullable();
            $table->string('currency_code')->default('USD');

            $table->string('description')->nullable();


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('invoices');
    }
}
