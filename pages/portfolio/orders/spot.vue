<script setup lang="ts">
const { t } = useLang()

const options = computed(() => [
  {
    to: '/portfolio/orders/spot',
    label: t('trade.openOrders')
  },
  {
    label: t('trade.tab.orderHistory'),
    to: '/portfolio/orders/spot/order-history'
  },
  {
    label: t('trade.tab.tradeHistory'),
    to: '/portfolio/orders/spot/trade-history'
  }
])
</script>

<template>
  <div>
    <div class="p-4">
      <h3 class="portfolio-title">{{ $t('portfolio.spotOrders') }}</h3>
    </div>

    <div class="flex items-center">
      <NuxtLink
        v-for="option in options"
        :key="option.label"
        :to="option.to"
        class="px-1 py-2 max-lg:text-sm text-center lg:p-4 text-coolGray-400 font-medium"
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
