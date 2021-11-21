<?php

namespace App\Models;

use App\Casts\Balances;
use App\Jobs\ProcessPodcast;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens;
    use HasFactory;
    use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'balances' => Balances::class,
        'held_balances' => Balances::class,
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'profile_photo_url',
    ];

    public function stores() {
        return $this->hasMany(Store::class);
    }
//    public function withdrawals() {
//        return $this->hasMany(Payment::class, 'payee_id')->w;
//    }

    public function balance($currency) {
//        $opt = $this->balances;
//        $opt['USD'] = 1;

        return number_format($this->balances[$currency], 2, '.', '');
    }

//    public function heldBalance($currency) {
//        return $this->heldBalances
//    }

//    public function sendPasswordResetNotification($token)
//    {
//        ProcessPodcast::dispatch($token)->delay(now()->addSeconds(10));
//    }

    public function addBalance($currency, $amount) {
        // TODO: what if user does not have $currency already listed?
        $this->balances[$currency] += $amount;
        return $this->save();
    }
    public function minusBalance($currency, $amount) {
        $this->balances[$currency] -= $amount;
        return $this->save();
    }
    public function addHeldBalance($currency, $amount) {
        $this->held_balances[$currency] += $amount;
        return $this->save();
    }
    public function minusHeldBalance($currency, $amount) {
        $this->held_balances[$currency] -= $amount;
        return $this->save();
    }
}
