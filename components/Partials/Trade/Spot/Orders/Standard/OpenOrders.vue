<script setup lang="ts">
const spotStore = useSpotStore()

const isMobile = useIsMobile()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersSpotOpenOrdersTableHeader v-if="!isMobile" />
    <div v-if="isMobile">
      <PartialsPortfolioOrdersSpotOpenOrdersTableMobileRow
        v-for="order in spotStore.subaccountOrders"
        :key="order.orderHash"
        v-bind="{ order }"
      />
    </div>

    <template v-else>
      <PartialsPortfolioOrdersSpotOpenOrdersTableRow
        v-for="order in spotStore.subaccountOrders"
        :key="order.orderHash"
        v-bind="{ order }"
      />
    </template>

    <CommonEmptyList
      v-if="spotStore.subaccountOrders.length === 0"
      v-bind="{ message: 'No Orders' }"
    />
  </div>
</template>
