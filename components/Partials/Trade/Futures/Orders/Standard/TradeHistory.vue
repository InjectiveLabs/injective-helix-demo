<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <PartialsPortfolioOrdersFuturesTradeHistoryTable
    v-if="derivativeStore.subaccountTrades.length"
    :trades="derivativeStore.subaccountTrades"
  />

  <CommonEmptyList
    v-if="!derivativeStore.subaccountTrades.length"
    :message="'No Trade History'"
  />
</template>
