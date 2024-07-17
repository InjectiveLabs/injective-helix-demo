<script setup lang="ts">
import { PortfolioSubPage } from '@/types'

const options = [
  {
    label: 'Open Orders',
    to: { name: PortfolioSubPage.OrdersFutures }
  },
  {
    label: 'Triggers',
    to: { name: PortfolioSubPage.OrdersFuturesTriggers }
  },
  {
    label: 'Order History',
    to: { name: PortfolioSubPage.OrdersFuturesOrderHistory }
  },
  {
    label: 'Trade History',
    to: { name: PortfolioSubPage.OrdersFuturesTradeHistory }
  }
]
</script>

<template>
  <div>
    <div class="p-4">
      <h3 class="portfolio-title">{{ $t('activity.derivativeOrders') }}</h3>
    </div>

    <div class="flex items-center">
      <NuxtLink
        v-for="option in options"
        :key="option.label"
        :to="option.to"
        class="px-2 py-4 max-lg:text-sm lg:p-4 text-gray-400 font-medium text-center"
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
