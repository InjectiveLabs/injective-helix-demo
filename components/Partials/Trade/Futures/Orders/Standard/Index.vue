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
  <div class="divide-y h-full">
    <PartialsTradeCommonOrdersBalances
      v-if="view === PerpOrdersStandardView.Balances"
    />

    <PartialsTradeFuturesOrdersStandardPositions
      v-else-if="view === PerpOrdersStandardView.Positions"
      v-bind="{ isTickerOnly }"
    />

    <PartialsTradeFuturesOrdersStandardOpenOrders
      v-else-if="view === PerpOrdersStandardView.Orders"
      v-bind="{ isTickerOnly }"
    />

    <PartialsTradeFuturesOrdersStandardAdvancedOrders
      v-else-if="view === PerpOrdersStandardView.AdvancedOrders"
    />

    <PartialsTradeFuturesOrdersStandardOrderHistory
      v-else-if="view === PerpOrdersStandardView.OrderHistory"
    />

    <PartialsTradeFuturesOrdersStandardTradeHistory
      v-else-if="view === PerpOrdersStandardView.TradeHistory"
    />

    <PartialsTradeFuturesOrdersStandardFundingHistory
      v-else-if="view === PerpOrdersStandardView.FundingHistory"
    />
  </div>
</template>
