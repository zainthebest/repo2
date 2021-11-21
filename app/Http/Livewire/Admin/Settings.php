<?php

namespace App\Http\Livewire\Admin;

use App\Models\Setting;
use Livewire\Component;

class Settings extends Component
{
    public $settings = [];

    public function mount() {
        $this->settings = Setting::all()->pluck(['value'], 'id');
    }

    public function render()
    {
        return view('admin.settings');
    }

    public function update($key) {
        $setting = Setting::find($key);
        $setting->value = $this->settings[$key];
        if ($setting->save()) {
            $this->emit('notification', 'Setting saved!');
        } else {
            $this->emit('notification', 'Oops! Unable to save setting.');
        }

    }
}
