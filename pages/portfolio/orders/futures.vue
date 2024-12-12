<script setup lang="ts">
import { PortfolioSubPage } from '@/types'

const { t } = useLang()

const options = [
  {
    label: t('trade.open_orders'),
    to: { name: PortfolioSubPage.OrdersFutures }
  },
  {
    label: t('activity.advancedOrders'),

    to: { name: PortfolioSubPage.OrdersFuturesAdvancedOrders }
  },
  {
    label: t('activity.orderHistory'),
    to: { name: PortfolioSubPage.OrdersFuturesOrderHistory }
  },
  {
    label: t('activity.tradeHistory'),
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
        class="px-2 py-4 max-lg:text-sm lg:p-4 text-coolGray-400 font-medium text-center"
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
