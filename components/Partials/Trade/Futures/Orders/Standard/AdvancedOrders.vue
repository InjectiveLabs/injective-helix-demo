<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <PartialsPortfolioOrdersFuturesAdvancedOrdersTable
    :advanced-orders="derivativeStore.subaccountConditionalOrders"
  />
</template>
