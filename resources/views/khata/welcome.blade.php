<div class="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
    {{-- Success is as dangerous as failure. --}}

    <h1 class="text-xl mb-7 w-90 -mt-52">
        <div>Khata App</div>
        <small class="text-gray-600">
            Save records of your daily transactions / expenses .
        </small>
    </h1>

    <div class="bg-white shadow-md w-96 p-3">
        Select a date to view transactions for
       <ul class="mt-2 space-y-2">
           <li>
               <x-link href="{{ route('khata.show', $today_date) }}">
                   {{ $today_date }} (today)
               </x-link>
           </li>
           <hr>
           @foreach($added_dates as $d)
               <li>
                   <x-link href="{{ route('khata.show', $today_date) }}">
                       {{ $d->created_at }}
                   </x-link>
               </li>
           @endforeach
       </ul>
    </div>
</div>
