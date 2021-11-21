<div

    x-data="{
        showToast: @entangle('showToast').defer,
        duration: @entangle('duration').defer
    }"
    x-init="$watch('showToast', showToast => {
        if (showToast) {
         console.log(duration)
            setTimeout(function () {
                $wire.hideToast();
            }, duration);
        }
        else {}
    })"
    >
    <div x-show="showToast"
         x-transition:enter="ease-out duration-300 delay-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="ease-in duration-200"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         class="text-white fixed md:left-8 md:mr-8 bottom-7 py-2 px-5 md:rounded shadow-md md:max-w-md z-50 {{ $classes }}">
        {{ $message }}
    </div>
</div>
