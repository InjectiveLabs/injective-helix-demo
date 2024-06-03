<script setup lang="ts">
const derivativeStore = useDerivativeStore()
const isMobile = useIsMobile()
</script>

<template>
  <div>
    <PartialsPortfolioOrdersFuturesTradeHistoryTableHeader v-if="!isMobile" />

    <div v-if="isMobile">
      <PartialsPortfolioOrdersFuturesTradeHistoryTableMobileRow
        v-for="trade in derivativeStore.subaccountTrades"
        :key="`${trade.orderHash}-${trade.tradeId}`"
        v-bind="{ trade }"
      />
    </div>

    <template v-else>
      <PartialsPortfolioOrdersFuturesTradeHistoryTableRow
        v-for="trade in derivativeStore.subaccountTrades"
        :key="`${trade.orderHash}-${trade.tradeId}`"
        v-bind="{ trade }"
      />
    </template>

    <CommonEmptyList
      v-if="derivativeStore.subaccountTrades.length === 0"
      :message="'No Trade History'"
    />
  </div>
</template>
