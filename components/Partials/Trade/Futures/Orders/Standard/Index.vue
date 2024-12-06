<script setup lang="ts">
import { PerpOrdersStandardView } from '@/types'

withDefaults(
  defineProps<{
    view: string
    isTickerOnly?: boolean
  }>(),
  {}
)
</script>

<template>
  <div class="border-b">
    <PartialsTradeCommonOrdersBalances
      v-if="view === PerpOrdersStandardView.Balances"
    />

    <PartialsTradeFuturesOrdersStandardPositions
      v-else-if="view === PerpOrdersStandardView.OpenPositions"
      v-bind="{ isTickerOnly }"
    />

    <PartialsTradeFuturesOrdersStandardOpenOrders
      v-else-if="view === PerpOrdersStandardView.OpenOrders"
      v-bind="{ isTickerOnly }"
    />

    <PartialsTradeFuturesOrdersStandardTriggers
      v-else-if="view === PerpOrdersStandardView.Triggers"
    />

    <PartialsTradeFuturesOrdersStandardOrderHistory
      v-else-if="view === PerpOrdersStandardView.OrderHistory"
    />

    <PartialsTradeFuturesOrdersStandardTradeHistory
      v-else-if="view === PerpOrdersStandardView.TradeHistory"
    />
  </div>
</template>
