<script setup lang="ts">
const spotStore = useSpotStore()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersSpotOrderHistoryTableHeader />
    <PartialsPortfolioOrdersSpotOrderHistoryTableRow
      v-for="order in spotStore.subaccountOrderHistory"
      :key="order.orderHash"
      v-bind="{ order }"
    />

    <CommonEmptyList
      v-if="spotStore.subaccountOrderHistory.length === 0"
      v-bind="{ message: 'No Orders' }"
    />
  </div>
</template>
