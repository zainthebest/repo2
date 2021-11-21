<?php

namespace App\Http\Livewire\Admin;

use App\Models\User;
use Carbon\Carbon;
use Livewire\Component;

class Users extends Component
{
    public $users;


    public function render()
    {
        return view('admin.users');
    }

    public function mount() {
        $this->users = User::latest()->get();
    }

    public function toggleDocsVerified($user_id) {
        $user = $this->users->find($user_id);
        if (is_null($user->docs_verified_at)) $user->docs_verified_at = Carbon::now();
        else $user->docs_verified_at = null;
        $user->save();

        $this->emit('notification', 'Success!');
    }
}
