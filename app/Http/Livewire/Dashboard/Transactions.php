<?php

namespace App\Http\Livewire\Dashboard;

use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class Transactions extends Component
{
    public $transactions = [];

    public function render()
    {
        return view('dashboard.transactions');
    }

    public function mount() {
        $this->transactions = Payment::where('payee_id', Auth::id())
                                    ->orWhere('payer_id', Auth::id())
                                    ->latest()->get();
    }
}
