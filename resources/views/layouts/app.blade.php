<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap">

    <!-- Styles -->
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">

    @livewireStyles

    <!-- Scripts -->
    <script src="{{ mix('js/app.js') }}" defer></script>
</head>
<body class="font-sans antialiased">
<div class="min-h-screen bg-gray-100">
    @if(auth()->user()->is_admin)
        <livewire:admin.nav-menu />
    @else
        @livewire('navigation-menu')
    @endif

<!-- Page Heading -->
    @if (isset($header))
        <header>
            <div
                class="@isset($headerMaxWidth) {{$headerMaxWidth}} @else max-w-7xl
@endisset mx-auto py-6 px-4 sm:px-6 lg:px-8 font-semibold text-2xl text-gray-800 leading-tight ">
                {{ $header }}
            </div>
        </header>
@endif

<!-- Page Content -->
    <main>
        {{ $slot }}
    </main>
</div>

<livewire:toast/>


{{--        <script src="js/code.js"></script>--}}
@stack('modals')

@livewireScripts
</body>
</html>
