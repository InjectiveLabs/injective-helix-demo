<script setup lang="ts">
const options = [
  {
    label: 'Live Spot Grid',
    to: '/portfolio/orders/spot-grid'
  },
  {
    label: 'Spot Grid History',
    to: '/portfolio/orders/spot-grid/history'
  }
]
</script>

<template>
  <div>
    <div class="p-4">
      <h3 class="portfolio-title">{{ $t('activity.spotGrid') }}</h3>
    </div>

    <div class="flex">
      <NuxtLink
        v-for="option in options"
        :key="option.label"
        :to="option.to"
        class="p-4 text-gray-400 font-medium"
        exact-active-class="text-white"
      >
        {{ option.label }}
      </NuxtLink>
    </div>

    <div>
      <NuxtPage />
    </div>
  </div>
</template>
