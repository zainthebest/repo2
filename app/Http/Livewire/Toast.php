<?php

namespace App\Http\Livewire;

use Livewire\Component;

class Toast extends Component
{

    protected $listeners = [
        'notification'
    ];
    public string $message = '';
    public $showToast = false;
    public int $duration = 2000;

    public string $classes = '';
    protected array $types = [
        'default' => 'bg-gray-600',
        'secondary' => 'bg-purple-500',
        'danger' => 'bg-red-700',
        'success' => 'bg-green-600',
        'warning' => 'bg-yellow-700',
    ];

    public function notification($msg='', $type='default', $duration = 5000) {
        $this->message = $msg;
        $this->classes = $this->types[$type];
        $this->duration = $duration;
        $this->showToast = true;
    }
    public function hideToast() {
        $this->showToast = false;
    }

    public function render()
    {
        return view('toast');
    }
}
