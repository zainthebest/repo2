<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class StoreName implements Rule
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
    public function passes($attribute, $value): bool
    {
        return strlen($value) >= 4 && strlen($value) <= 100 && preg_match('/^([A-Za-z0-9 _.-])+$/',$value);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message(): string
    {
        return 'Store name may only contain alphabets, numbers (0-9), underscores (_), dots (.), hyphens (-) and white spaces. Maximum 100 characters are allowed';
    }
}
