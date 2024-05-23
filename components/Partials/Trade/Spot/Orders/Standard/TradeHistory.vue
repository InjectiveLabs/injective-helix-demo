<script setup lang="ts">
const spotStore = useSpotStore()
const isMobile = useIsMobile()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersSpotTradeHistoryTableHeader v-if="!isMobile" />

    <div v-if="isMobile">
      <PartialsPortfolioOrdersSpotTradeHistoryTableMobileRow
        v-for="trade in spotStore.subaccountTrades"
        :key="trade.orderHash"
        v-bind="{ trade }"
      />
    </div>

    <template v-else>
      <PartialsPortfolioOrdersSpotTradeHistoryTableRow
        v-for="trade in spotStore.subaccountTrades"
        :key="trade.orderHash"
        v-bind="{ trade }"
      />
    </template>

    <CommonEmptyList
      v-if="spotStore.subaccountTrades.length === 0"
      v-bind="{ message: 'No Trades' }"
    />
  </div>
</template>
