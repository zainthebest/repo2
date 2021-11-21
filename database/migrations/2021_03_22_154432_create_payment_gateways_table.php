<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentGatewaysTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('payment_gateways', function (Blueprint $table) {
            $table->string('name')->primary()->unique();
            $table->string('display_name');
            $table->boolean('requires_approval');
            $table->string('payments_to')->nullable();
            $table->string('secret_key')->nullable();
            $table->unsignedInteger('hold_payments_for')->default(0);
            $table->unsignedFloat('fee_amount')->default(0);
            $table->unsignedFloat('fee_percentage')->default(0);
            $table->json('other_data')->default(json_encode([]));

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
        Schema::dropIfExists('payment_gateways');
    }
}
