<x-app-layout>
    <x-slot name="header">
        {{ __('Dashboard') }}
    </x-slot>

    <div class="pb-12">
        <div class="max-w-7xl mx-auto px-3 lg:px-8 ">

            @php
                $colors = ['bg-red-300', 'bg-green-300', 'bg-blue-300'];
            @endphp

            <div class="flex" style="
            column-gap: 10px;
                flex-wrap: wrap;">
                @foreach(\App\Models\Currency::latest()->get(['id']) as $currency)
                    <div
                        style="flex: 1 1 15rem;"
                        class=" {{ $colors[$loop->index] ?? 'bg-purple-300' }} mb-4 inline-block p-4 shadow-md">
                        <h2 class="text-2xl mb-3">{{ $currency->id }}</h2>
                        <h2 class="font-bold">Current: {{ Auth::user()->balance($currency->id) }}</h2>
                        <h2 class="">On Hold: {{ Auth::user()->held_balances[$currency->id] }}</h2>
                        {{--                    <h2 class="">Withdrawn: {{ Auth::user()->withdrawals()->where([["currency",'=',$currency->id], ['status','=','completed']])->sum('amount') }}</h2>--}}
                    </div>
                @endforeach
            </div>
{{--            <canvas id="myChart" width="400" height="400"></canvas>--}}
{{--            <script>--}}
{{--                var ctx = document.getElementById('myChart').getContext('2d');--}}
{{--                var myChart = new Chart(ctx, {--}}
{{--                    type: 'bar',--}}
{{--                    data: {--}}
{{--                        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],--}}
{{--                        datasets: [{--}}
{{--                            label: '# of Votes',--}}
{{--                            data: [12, 19, 3, 5, 2, 3],--}}
{{--                            backgroundColor: [--}}
{{--                                'rgba(255, 99, 132, 0.2)',--}}
{{--                                'rgba(54, 162, 235, 0.2)',--}}
{{--                                'rgba(255, 206, 86, 0.2)',--}}
{{--                                'rgba(75, 192, 192, 0.2)',--}}
{{--                                'rgba(153, 102, 255, 0.2)',--}}
{{--                                'rgba(255, 159, 64, 0.2)'--}}
{{--                            ],--}}
{{--                            borderColor: [--}}
{{--                                'rgba(255, 99, 132, 1)',--}}
{{--                                'rgba(54, 162, 235, 1)',--}}
{{--                                'rgba(255, 206, 86, 1)',--}}
{{--                                'rgba(75, 192, 192, 1)',--}}
{{--                                'rgba(153, 102, 255, 1)',--}}
{{--                                'rgba(255, 159, 64, 1)'--}}
{{--                            ],--}}
{{--                            borderWidth: 1--}}
{{--                        }]--}}
{{--                    },--}}
{{--                    options: {--}}
{{--                        scales: {--}}
{{--                            y: {--}}
{{--                                beginAtZero: true--}}
{{--                            }--}}
{{--                        }--}}
{{--                    }--}}
{{--                });--}}
{{--            </script>--}}

            <br>
            <div class="mt-5 bg-white overflow-hidden shadow-xl sm:rounded-lg">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi, perspiciatis.
            </div>

        </div>
    </div>
</x-app-layout>
