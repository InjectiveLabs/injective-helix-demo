<script setup lang="ts">
//
</script>

<template>
  <div class="divide-y border-y">
    <PartialsPortfolioOrdersFuturesOrderHistoryTabs />
    <PartialsPortfolioOrdersFuturesOrderHistoryTableHeader />
    <PartialsPortfolioOrdersFuturesOrderHistoryTableRow
      v-for="i in 5"
      :key="i"
    />
  </div>
</template>
