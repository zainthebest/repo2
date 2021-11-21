<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payer_id')->nullable();
            $table->string('payee_id')->nullable();
            // TODO does above line should be here as X:belongsTo use kar rahy hain
//            $table->foreignId('payee_id')
//                ->references('id')
//                ->on('users');
            $table->string('currency');
            $table->foreign('currency')
                    ->references('id')
                    ->on('currencies');

            $table->unsignedFloat('amount');
            $table->unsignedFloat('fee_for_payer')->default(0);
            $table->unsignedFloat('fee_for_payee')->default(0);

            $table->enum('status', ['completed', 'on_hold', 'disputed', 'cancelled']);
            $table->unsignedInteger('available_at')->nullable();

            $table->string('reference')->nullable();
            $table->json('details')->default('[]');
            $table->string('description')->nullable();
            $table->string('payment_gateway');
            $table->timestamps();
        });
        DB::statement('ALTER TABLE payments AUTO_INCREMENT = 100000000001');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('payments');
    }
}
