<script setup lang="ts">
const spotStore = useSpotStore()
</script>

<template>
  <PartialsPortfolioOrdersSpotOrderHistoryTable
    v-if="spotStore.subaccountOrderHistory.length"
    :orders="spotStore.subaccountOrderHistory"
  />

  <CommonEmptyList
    v-if="!spotStore.subaccountOrderHistory.length"
    v-bind="{ message: $t('trade.noOrders') }"
  />
</template>
