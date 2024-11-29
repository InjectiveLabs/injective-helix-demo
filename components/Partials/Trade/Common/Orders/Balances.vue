<script setup lang="ts">
const search = ref('')
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioBalancesSubaccountTable
      v-bind="{ search, tableHeaderClass: 'bg-brand-850' }"
    />
  </div>
</template>
