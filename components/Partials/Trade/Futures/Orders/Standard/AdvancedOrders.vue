<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <PartialsPortfolioOrdersFuturesAdvancedOrdersTable
    v-if="derivativeStore.subaccountConditionalOrders.length"
    :advanced-orders="derivativeStore.subaccountConditionalOrders"
  />

  <CommonEmptyList
    v-if="!derivativeStore.subaccountConditionalOrders.length"
    :message="$t('trade.emptyAdvancedOrders')"
  />
</template>
