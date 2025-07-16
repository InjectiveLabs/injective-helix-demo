<script setup lang="ts">
const activityStore = useActivityStore()
</script>

<template>
  <PartialsPortfolioHistoryFundingTable
    v-if="activityStore.subaccountFundingHistory.length"
    :funding-history="activityStore.subaccountFundingHistory"
  />

  <CommonEmptyList
    v-if="!activityStore.subaccountFundingHistory.length"
    v-bind="{ message: $t('fundingHistory.noFundingHistory') }"
  />
</template>
