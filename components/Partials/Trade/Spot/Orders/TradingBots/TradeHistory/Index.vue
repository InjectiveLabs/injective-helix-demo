<script setup lang="ts">
const spotStore = useSpotStore()
</script>

<template>
  <PartialsPortfolioOrdersSpotTradeHistoryTable
    v-if="spotStore.subaccountTrades.length"
    :trades="spotStore.subaccountTrades"
  />

  <CommonEmptyList
    v-if="!spotStore.subaccountTrades.length"
    v-bind="{ message: $t('trade.noTrades') }"
  />
</template>
