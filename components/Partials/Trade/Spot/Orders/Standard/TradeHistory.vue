<script setup lang="ts">
const spotStore = useSpotStore()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersSpotTradeHistoryTable
      v-if="spotStore.subaccountTrades.length"
      :trades="spotStore.subaccountTrades"
    />

    <CommonEmptyList
      v-if="!spotStore.subaccountTrades.length"
      v-bind="{ message: 'No Trades' }"
    />
  </div>
</template>
