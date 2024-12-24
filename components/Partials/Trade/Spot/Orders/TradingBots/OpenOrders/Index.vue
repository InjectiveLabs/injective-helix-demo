<script setup lang="ts">
const spotStore = useSpotStore()
</script>

<template>
  <PartialsPortfolioOrdersSpotOpenOrdersTable
    v-if="spotStore.subaccountOrders.length"
    :orders="spotStore.subaccountOrders"
    :is-trading-bots="true"
  />

  <CommonEmptyList
    v-if="!spotStore.subaccountOrders.length"
    v-bind="{ message: $t('trade.noOrders') }"
  />
</template>
