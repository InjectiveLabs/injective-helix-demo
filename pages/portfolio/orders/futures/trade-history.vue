<script setup lang="ts">
//
</script>

<template>
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersFuturesTradeHistoryTabs />
    <PartialsPortfolioOrdersFuturesTradeHistoryTableHeader />
    <PartialsPortfolioOrdersFuturesTradeHistoryTableRow
      v-for="i in 5"
      :key="i"
    />
  </div>
</template>
