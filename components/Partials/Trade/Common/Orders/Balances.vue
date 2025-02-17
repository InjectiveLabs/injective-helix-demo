<script setup lang="ts">
const search = ref('')
</script>

<template>
  <PartialsPortfolioBalancesSubaccountTable v-bind="{ search }" />
</template>
