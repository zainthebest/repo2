<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ClearPendingFunds implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $pending_id = '';

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($pending_id)
    {
        $this->pending_id = $pending_id;

    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // Clear funds that are pending...
        info('Clearing pending funds with the id of'. $this->pending_id);
    }
}
