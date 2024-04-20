<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersFuturesOrderHistoryTableHeader />
    <PartialsPortfolioOrdersFuturesOrderHistoryTableRow
      v-for="order in derivativeStore.subaccountOrderHistory"
      :key="`${order.orderHash}-${order.cid}`"
      v-bind="{ order }"
    />

    <CommonEmptyList
      v-if="derivativeStore.subaccountOrderHistory.length === 0"
      :message="'No Order History'"
    />
  </div>
</template>
