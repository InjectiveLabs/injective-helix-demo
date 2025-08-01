<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <PartialsPortfolioOrdersFuturesTradeHistoryTable
    :trades="derivativeStore.subaccountTrades"
  />
</template>
