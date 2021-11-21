<?php

namespace App\Http\Livewire\Khata;

use App\Models\KhataTransaction;
use Carbon\Carbon;
use Livewire\Component;

class Welcome extends Component
{
    public $today_date;
    public $added_dates = [];

    public function render()
    {
        return view('khata.welcome')->layout('layouts.guest');
    }

    public function mount() {
        $today = Carbon::today('Asia/karachi');
        $this->today_date = $this->formatted($today);

        $this->added_dates = KhataTransaction::select('created_at')->get();
    }

    protected function formatted($date, $format='D, M d, Y') {
        return Carbon::parse($date)->format($format);
    }
}
