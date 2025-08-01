<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <PartialsPortfolioOrdersFuturesOrderHistoryTable
    :orders="derivativeStore.subaccountOrderHistory"
  />
</template>
