<script setup lang="ts">
import { MarketKey } from '@/types'
import type { UiDerivativeMarket } from '@/types'

const derivativeStore = useDerivativeStore()

const props = withDefaults(
  defineProps<{
    isTickerOnly?: boolean
  }>(),
  {}
)

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const filteredOrders = computed(() =>
  derivativeStore.subaccountOrders.filter((order) => {
    if (props.isTickerOnly) {
      return order.marketId === derivativeMarket.value.marketId
    }

    return true
  })
)
</script>

<template>
  <PartialsPortfolioOrdersFuturesOpenOrdersTable :orders="filteredOrders" />
</template>
