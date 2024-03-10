<script setup lang="ts">
//
</script>

<template>
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersSpotTradeHistoryTabs />
    <PartialsPortfolioOrdersSpotTradeHistoryTableHeader />
    <PartialsPortfolioOrdersSpotTradeHistoryTableRow v-for="i in 5" :key="i" />
  </div>
</template>
