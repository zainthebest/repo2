@props(['defaultLength' => '100'])

<span x-data="
    {
        text: `{{ $slot }}`,
        lengthToShow: {{ $defaultLength }},
        defaultLength: {{ $defaultLength }},
        readingMore: false
    }"
    >
    <span x-text="text.substr(0, lengthToShow)"></span><span x-show="! readingMore && lengthToShow < text.length">...</span>
    <x-link x-show="!readingMore" href="#" @click="lengthToShow = text.length;readingMore = true">Read more</x-link>
    <x-link x-show="readingMore" href="#" @click="lengthToShow = defaultLength;readingMore = false">Show less</x-link>
</span>


