<script setup lang="ts">
const spotStore = useSpotStore()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersSpotTradeHistoryTableHeader />
    <PartialsPortfolioOrdersSpotTradeHistoryTableRow
      v-for="trade in spotStore.subaccountTrades"
      :key="trade.orderHash"
      v-bind="{ trade }"
    />

    <CommonEmptyList
      v-if="spotStore.subaccountTrades.length === 0"
      v-bind="{ message: 'No Trades' }"
    />
  </div>
</template>
