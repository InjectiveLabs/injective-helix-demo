<script setup lang="ts">
import { OrderbookStatusKey } from '~/types'

const orderbookStore = useOrderbookStore()
const orderbookStatus = inject(OrderbookStatusKey)
</script>

<template>
  <div class="relative">
    <PartialsTradeChartDepthChart
      v-if="!orderbookStatus?.isLoading()"
      v-bind="{
        sells: orderbookStore.sells,
        buys: orderbookStore.buys
      }"
    />
  </div>
</template>
