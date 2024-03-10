<script setup lang="ts">
const options = [
  {
    label: 'Open Orders',
    to: '/portfolio/orders/futures'
  },
  {
    label: 'Triggers',
    to: '/portfolio/orders/futures/triggers'
  },
  {
    label: 'Order History',
    to: '/portfolio/orders/futures/order-history'
  },
  {
    label: 'Trade History',
    to: '/portfolio/orders/futures/trade-history'
  }
]
</script>

<template>
  <div>
    <div class="p-4">
      <h3 class="portfolio-title">{{ $t('activity.derivativeOrders') }}</h3>
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
