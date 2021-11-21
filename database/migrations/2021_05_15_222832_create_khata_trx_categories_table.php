<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateKhataTrxCategoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('khata_trx_categories', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['for_IN', 'for_OUT']);
            $table->string('name');
            $table->timestamps();
        });

        \App\Models\KhataTrxCategory::create([
            'name' => 'Purchase',
            'type' => 'for_OUT'
        ]);
        \App\Models\KhataTrxCategory::create([
            'name' => 'Expense',
            'type' => 'for_OUT'
        ]);
        \App\Models\KhataTrxCategory::create([
            'name' => 'Advance salary',
            'type' => 'for_OUT'
        ]);
        \App\Models\KhataTrxCategory::create([
            'name' => 'Sale',
            'type' => 'for_IN'
        ]);
        \App\Models\KhataTrxCategory::create([
            'name' => 'Bank withdraw',
            'type' => 'for_IN'
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('khata_trx_categories');
    }
}
