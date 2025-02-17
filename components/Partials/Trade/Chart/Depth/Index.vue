<script setup lang="ts">
import { MarketKey, OrderbookStatusKey } from '@/types'

const orderbookStore = useOrderbookStore()
const orderbookStatus = inject(OrderbookStatusKey)
const market = inject(MarketKey)
</script>

<template>
  <div class="relative">
    <PartialsTradeChartDepthChart
      v-if="
        !orderbookStatus?.isLoading() &&
        orderbookStore.sells.length > 0 &&
        orderbookStore.buys.length > 0
      "
      v-bind="{
        sells: orderbookStore.sells,
        buys: orderbookStore.buys,
        priceDecimals: market?.priceDecimals,
        symbol: market?.quoteToken.symbol
      }"
    />
  </div>
</template>
