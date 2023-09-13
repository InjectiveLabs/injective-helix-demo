<script lang="ts" setup>
defineProps({
  isHero: Boolean
})
</script>

<template>
  <div
    class="grid grid-cols-12"
    :class="{
      'min-w-3xl lg:min-w-[912px]': !isHero,
      'gap-4': isHero
    }"
  >
    <span
      class="col-span-4 uppercase text-gray-200 whitespace-nowrap text-xs pl-4"
    >
      {{ $t('home.market') }}
    </span>
    <span
      class="uppercase text-gray-200 whitespace-nowrap text-xs text-right"
      :class="{ 'col-span-2': !isHero, 'col-span-3': isHero }"
    >
      {{ $t('home.lastPrice') }}
    </span>
    <span
      class="uppercase text-gray-200 whitespace-nowrap text-xs col-span-2"
      :class="{ 'text-right': !isHero }"
    >
      {{ $t('home.change24h') }}
    </span>
    <span
      v-if="!isHero"
      class="col-span-2 uppercase text-gray-200 whitespace-nowrap text-xs text-center"
    >
      {{ $t('home.sevenDaysPrice') }}
    </span>
    <div v-if="!isHero" class="col-span-3" />
  </div>
</template>
