<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateKhataTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('khata_transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['for_IN', 'for_OUT']);
            $table->foreignId('category_id')
                ->references('id')
                ->on('khata_trx_categories')
                ->nullOnDelete();
            $table->float('amount');
            $table->text('description')->nullable();
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
        Schema::dropIfExists('khata_transactions');
    }
}
