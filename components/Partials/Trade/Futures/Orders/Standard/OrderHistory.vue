<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <PartialsPortfolioOrdersFuturesOrderHistoryTable
    v-if="derivativeStore.subaccountOrderHistory.length"
    :orders="derivativeStore.subaccountOrderHistory"
  />

  <CommonEmptyList
    v-if="!derivativeStore.subaccountOrderHistory.length"
    :message="$t('trade.noOrderHistory')"
  />
</template>
