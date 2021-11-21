<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use phpDocumentor\Reflection\Types\Boolean;

class PaymentGateway extends Model
{
    protected $guarded = [];
    protected $primaryKey = 'name';
    protected $keyType = 'string';
    public $incrementing = false;

    use HasFactory;

    protected $casts = [
        'other_data' => AsArrayObject::class,
        'requires_approval' => 'boolean'
    ];
}
