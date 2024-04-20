<script setup lang="ts">
const spotStore = useSpotStore()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersSpotOpenOrdersTableHeader />
    <PartialsPortfolioOrdersSpotOpenOrdersTableRow
      v-for="order in spotStore.subaccountOrders"
      :key="order.orderHash"
      v-bind="{ order }"
    />

    <CommonEmptyList
      v-if="spotStore.subaccountOrders.length === 0"
      v-bind="{ message: 'No Orders' }"
    />
  </div>
</template>
