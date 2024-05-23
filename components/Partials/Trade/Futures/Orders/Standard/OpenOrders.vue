<script setup lang="ts">
const derivativeStore = useDerivativeStore()
const isMobile = useIsMobile()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersFuturesOpenOrdersTableHeader v-if="!isMobile" />

    <div v-if="isMobile">
      <PartialsPortfolioOrdersFuturesOpenOrdersTableMobileRow
        v-for="order in derivativeStore.subaccountOrders"
        :key="`${order.orderHash}-${order.cid}`"
        v-bind="{ order }"
      />
    </div>

    <template v-else>
      <PartialsPortfolioOrdersFuturesOpenOrdersTableRow
        v-for="order in derivativeStore.subaccountOrders"
        :key="`${order.orderHash}-${order.cid}`"
        v-bind="{ order }"
      />
    </template>

    <CommonEmptyList
      v-if="derivativeStore.subaccountOrders.length === 0"
      :message="'No Open Orders'"
    />
  </div>
</template>
