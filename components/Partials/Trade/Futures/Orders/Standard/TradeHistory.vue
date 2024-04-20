<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <div>
    <PartialsPortfolioOrdersFuturesTradeHistoryTableHeader />

    <PartialsPortfolioOrdersFuturesTradeHistoryTableRow
      v-for="trade in derivativeStore.subaccountTrades"
      :key="`${trade.orderHash}-${trade.tradeId}`"
      v-bind="{ trade }"
    />

    <CommonEmptyList
      v-if="derivativeStore.subaccountTrades.length === 0"
      :message="'No Trade History'"
    />
  </div>
</template>
