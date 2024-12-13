<script setup lang="ts">
import { SpotOrdersStandardView } from '@/types'

withDefaults(
  defineProps<{
    view: string
    isTickerOnly: boolean
  }>(),
  {}
)
</script>

<template>
  <div class="overflow-x-auto divide-y h-full">
    <PartialsTradeCommonOrdersBalances
      v-if="view === SpotOrdersStandardView.Balances"
    />

    <PartialsTradeSpotOrdersStandardOpenOrders
      v-else-if="view === SpotOrdersStandardView.Orders"
      v-bind="{ isTickerOnly }"
    />

    <PartialsTradeSpotOrdersStandardOrderHistory
      v-else-if="view === SpotOrdersStandardView.OrderHistory"
    />

    <PartialsTradeSpotOrdersStandardTradeHistory
      v-else-if="view === SpotOrdersStandardView.TradeHistory"
    />
  </div>
</template>
