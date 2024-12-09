<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <PartialsPortfolioOrdersFuturesTriggersTable
    v-if="derivativeStore.subaccountConditionalOrders.length"
    :triggers="derivativeStore.subaccountConditionalOrders"
  />

  <CommonEmptyList
    v-if="!derivativeStore.subaccountConditionalOrders.length"
    :message="$t('trade.emptyTriggers')"
  />
</template>
