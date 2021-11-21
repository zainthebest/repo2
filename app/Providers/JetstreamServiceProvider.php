<?php

namespace App\Providers;

use App\Actions\Jetstream\DeleteUser;
use App\Http\Livewire\Invoice\Show;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Laravel\Jetstream\Jetstream;

class JetstreamServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */

    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */




    public function boot()
    {

        $this->registerComponents();

        $this->configurePermissions();

        Jetstream::deleteUsersUsing(DeleteUser::class);


    }

    /**
     * Configure the permissions that are available within the application.
     *
     * @return void
     */
    protected function configurePermissions()
    {
        Jetstream::defaultApiTokenPermissions(['withdraw_funds']);

        Jetstream::permissions([
            'withdraw_funds'
        ]);
    }

    protected function registerComponent($name) {
        Blade::component("components.$name", $name);
    }


    protected function registerComponents() {
        Blade::component('jetstream::components.'.'application-mark', 'jet-'.'application-mark');

        $this->registerComponent('link');
    }



}
