<?php

namespace App\Http\Livewire;

use Livewire\Component;

class Snackbar extends Component
{
    public static function make($message, $duration = 2000, $type = 'default')
    {
        $this0emit('notification', $message, $type, $duration);
    }
}
