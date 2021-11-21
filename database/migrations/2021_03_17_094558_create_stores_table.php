<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStoresTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->string('name');
            $table->text('website_url');
            $table->text('success_url');
            $table->text('fail_url');
            $table->text('callback_url');
            $table->string('secret_key')->nullable();
            $table->enum('fee_payer', ['both', 'payee', 'payer'])->default('both');
            $table->json('user_allowed_pay_gateways')->default(json_encode([]));
            $table->json('approved_payment_gateways')->default(json_encode([]));
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

        DB::statement('ALTER TABLE stores AUTO_INCREMENT = 10000001');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('stores');
    }
}
