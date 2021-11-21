<?php

namespace App\Models;

use App\Jobs\ReleasePayment;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Payment extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
//        'available_at' => 'datetime'
    'details' => AsArrayObject::class
    ];

    public function getCreatedAtAttribute() {
        return Carbon::createFromFormat('Y-m-d H:i:s', $this->attributes['created_at'])
            ->format('M j, Y H:i:s');
    }

    public function getAvailableOnAttribute() {
        if ($this->available_at == '') return 'Unknown';
        $re = date("M j, Y H:i:s", $this->available_at);
        return $re;
    }

    public function removeDispute() {
        // Dispute can only be remove if it is there

        if ($this->status !== 'disputed') return false;

        $seconds = PaymentGateway::findOrFail($this->payment_gateway)->hold_payments_for;

        $this->available_at = now()->addSeconds($seconds)->getTimestamp();
        $this->status = 'on_hold';
        $this->save();

        ReleasePayment::dispatch($this)->delay(now()->addSeconds($seconds));

//        info('see this', [json_encode(, JSON_PRETTY_PRINT)]);
        return true;
    }
    public function markAsDisputed() {
        if ($this->status === 'on_hold') {
            // Minus held balance from user account
            $user = User::find($this->payee_id);

            $this->status = 'disputed';
            $this->available_at = null;
            return $this->save();
        } else if ($this->status === 'completed') {
            // Minus balance from user account
            $user = User::find($this->payee_id);
            $r1 = $user->minusBalance($this->currency, $this->amount);
            $user->addHeldBalance($this->currency, $this->amount);
            Log::debug('Add to held balance:'.$this->currency. $this->amount, ['Payment::markAsDisputed() - '.$this->id]);

            $this->status = 'disputed';
            $this->available_at = null;
            $r2 = $this->save();
            return $r1 && $r2;
        }
        return false;
    }
    public function markAsCancelled() {
        if ($this->status === 'disputed') {
            $this->status = 'cancelled';
            $this->available_at = null;
            $r1 = $this->save();

            $r2 = User::find($this->payee_id)->minusHeldBalance($this->currency, $this->amount);
            Log::debug('Minus from held balance:'.$this->currency. $this->amount, ['Payment::markAsCancelled() - '.$this->id]);
            return $r1 && $r2;
        }
        return false;
    }

    public function payee() {
        return $this->belongsTo(User::class, 'payee_id');
    }
    public function payer() {
        return $this->belongsTo(User::class, 'payer_id');
    }
}
