<?php

namespace App\Http\Livewire\Khata;

use App\Models\KhataTransaction;
use App\Models\KhataTrxCategory;
use Carbon\Carbon;
use Livewire\Component;

class View extends Component
{
    public $date;
    public $record = [];
    public $categories = [];
    public $transactions = [];

    public function render()
    {
        return view('khata.view')->layout('layouts.guest');
    }

    public function mount($date) {
        $this->categories = KhataTrxCategory::all();
//        dd();
        $formatted_date = Carbon::createFromFormat('D, M d, Y', $this->date)->format('Y-m-d');
        $this->transactions = KhataTransaction::where('created_at', $formatted_date)->get();
        $this->transactions = KhataTransaction::all();

    }

    public function newCashInRecord() {
        $this->validate();

        // save record in database
        $this->record['type'] = 'for_IN';
//        $this->record['created_at'] = Carbon::pa;
        $trx = KhataTransaction::create($this->record);
//

        if ($trx) {
            $this->record = [];
            $this->emit('notification', 'Record added!');
            $this->dispatchBrowserEvent('close_popup_for_new_in');
        } else {
            $this->emit('notification', 'Unable to add record, something went wrong.');
        }
    }

    protected function getRules()
    {
        return [
            'record.category_id' => 'required',
            'record.amount' => 'required|int',
            'record.description' => 'nullable'
        ];//
    }
}
