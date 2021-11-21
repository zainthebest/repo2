<?php

namespace App\Casts;

use App\Models\Currency;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Casts\ArrayObject;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Database\Eloquent\Castable;

class Balances implements Castable
{
    /**
     * Get the caster class to use when casting from / to this cast target.
     *
     * @param  array  $arguments
     * @return object|string
     */
    public static function castUsing(array $arguments)
    {
        return new class implements CastsAttributes {
            public function get($model, $key, $value, $attributes)
            {
                $balances = json_decode($attributes[$key], true);
                // TODO: Change below line for performance
                $currencies = Currency::all('id')->pluck('id');
                foreach ($currencies as $currency) {
                    if (!isset($balances[$currency])) {
                        $balances[$currency] = 0;
                    }
                }
                foreach ($balances as $k => $v) {
                    if (!$currencies->contains($k)) {
                        // $k = USD or PKR or ...
                        unset($balances[$k]);
                        $model[$key] = $balances;
                        $model->save();
                        Log::info("Unset User $key. Unset: $k = $v. User Id ".auth()->id());
                    }
                }

                return new ArrayObject($balances);
            }

            public function set($model, $key, $value, $attributes)
            {
                return [$key => json_encode($value)];
            }

            public function serialize($model, string $key, $value, array $attributes)
            {
                return $value->getArrayCopy();
            }
        };
    }
}
