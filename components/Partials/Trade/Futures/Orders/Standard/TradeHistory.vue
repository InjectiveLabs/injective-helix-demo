<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <div>
    <PartialsPortfolioOrdersFuturesTradeHistoryTable
      v-if="derivativeStore.subaccountTrades.length"
      :trades="derivativeStore.subaccountTrades"
    />

    <CommonEmptyList
      v-if="!derivativeStore.subaccountTrades.length"
      :message="'No Trade History'"
    />
  </div>
</template>
