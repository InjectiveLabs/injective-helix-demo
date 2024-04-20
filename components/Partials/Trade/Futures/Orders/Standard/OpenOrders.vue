<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersFuturesOpenOrdersTableHeader />

    <PartialsPortfolioOrdersFuturesOpenOrdersTableRow
      v-for="order in derivativeStore.subaccountOrders"
      :key="`${order.orderHash}-${order.cid}`"
      v-bind="{ order }"
    />

    <CommonEmptyList
      v-if="derivativeStore.subaccountOrders.length === 0"
      :message="'No Open Orders'"
    />
  </div>
</template>
