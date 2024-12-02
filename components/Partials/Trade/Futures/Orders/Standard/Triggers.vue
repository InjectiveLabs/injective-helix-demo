<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersFuturesTriggersTable
      v-if="derivativeStore.subaccountConditionalOrders.length"
      :triggers="derivativeStore.subaccountConditionalOrders"
    />

    <CommonEmptyList
      v-if="!derivativeStore.subaccountConditionalOrders.length"
      :message="$t('trade.emptyTriggers')"
    />
  </div>
</template>
