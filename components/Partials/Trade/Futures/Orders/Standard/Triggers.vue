<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersFuturesTriggersTableHeader />
    <PartialsPortfolioOrdersFuturesTriggersTableRow
      v-for="trigger in derivativeStore.subaccountConditionalOrders"
      :key="`${trigger.orderHash}-${trigger.cid}`"
      v-bind="{ trigger }"
    />

    <CommonEmptyList
      v-if="derivativeStore.subaccountConditionalOrders.length === 0"
      :message="'No Triggers Found'"
    />
  </div>
</template>
