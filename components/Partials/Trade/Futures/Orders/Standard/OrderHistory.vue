<script setup lang="ts">
const derivativeStore = useDerivativeStore()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersFuturesOrderHistoryTable
      v-if="derivativeStore.subaccountOrderHistory.length"
      :orders="derivativeStore.subaccountOrderHistory"
    />

    <CommonEmptyList
      v-if="!derivativeStore.subaccountOrderHistory.length"
      :message="'No Order History'"
    />
  </div>
</template>
