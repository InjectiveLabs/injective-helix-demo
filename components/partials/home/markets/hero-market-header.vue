<template>
  <div class="grid grid-cols-12 gap-12 px-4">
    <span
      class="col-span-4 uppercase text-helixGray-500 whitespace-nowrap text-xs"
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
    <span
      class="col-span-2 uppercase text-helixGray-500 whitespace-nowrap text-xs"
    >
      {{ $t('home.sevenDaysPrice') }}
    </span>
    <div class="col-span-1" />
  </div>
</template>
