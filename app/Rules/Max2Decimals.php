<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class Max2Decimals implements Rule
{
    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        return (
            is_numeric($value)
            && is_float(floatval($value)) && $value >= 0.01
            && strlen(substr(strrchr($value, "."), 1)) < 3
        );
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'Minimum :attribute 0.01 and maximum two digits are allowed after decimal point.';
    }
}
