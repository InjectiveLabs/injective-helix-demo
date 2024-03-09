<script setup lang="ts">
//
</script>

<template>
  <div class="border-y divide-y">
    <PartialsPortfolioBalancesSubaccountTabs />

    <PartialsPortfolioBalancesSubaccountTableHeader />
    <PartialsPortfolioBalancesSubaccountTableRow v-for="i in 5" :key="i" />
  </div>
</template>
