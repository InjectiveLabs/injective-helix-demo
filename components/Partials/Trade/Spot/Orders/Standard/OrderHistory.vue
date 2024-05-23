<script setup lang="ts">
const spotStore = useSpotStore()
const isMobile = useIsMobile()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersSpotOrderHistoryTableHeader v-if="!isMobile" />

    <div v-if="isMobile">
      <PartialsPortfolioOrdersSpotOrderHistoryTableMobileRow
        v-for="order in spotStore.subaccountOrderHistory"
        :key="order.orderHash"
        v-bind="{ order }"
      />
    </div>

    <template v-else>
      <PartialsPortfolioOrdersSpotOrderHistoryTableRow
        v-for="order in spotStore.subaccountOrderHistory"
        :key="order.orderHash"
        v-bind="{ order }"
      />
    </template>

    <CommonEmptyList
      v-if="spotStore.subaccountOrderHistory.length === 0"
      v-bind="{ message: 'No Orders' }"
    />
  </div>
</template>
