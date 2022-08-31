<template>
  <div class="grid grid-cols-12 items-center gap-10 box-content">
    <span
      class="pl-4 col-span-4 uppercase text-helixGray-500 whitespace-nowrap text-xs"
    >
      {{ $t('home.market') }}
    </span>
    <span
      class="col-span-3 uppercase text-helixGray-500 whitespace-nowrap text-xs text-right"
    >
      {{ $t('home.lastPrice') }}
    </span>
    <span
      class="col-span-2 uppercase text-helixGray-500 whitespace-nowrap text-xs"
    >
      {{ $t('home.change24h') }}
    </span>
    <span class="col-span-3"> </span>
  </div>
</template>
