<script setup lang="ts">
const spotStore = useSpotStore()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersSpotOrderHistoryTable
      v-if="spotStore.subaccountOrderHistory.length"
      :orders="spotStore.subaccountOrderHistory"
    />

    <CommonEmptyList
      v-if="!spotStore.subaccountOrderHistory.length"
      v-bind="{ message: 'No Orders' }"
    />
  </div>
</template>
