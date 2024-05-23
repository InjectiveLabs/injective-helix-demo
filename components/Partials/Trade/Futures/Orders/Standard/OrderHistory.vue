<script setup lang="ts">
const derivativeStore = useDerivativeStore()
const isMobile = useIsMobile()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersFuturesOrderHistoryTableHeader v-if="!isMobile" />
    <div v-if="isMobile">
      <PartialsPortfolioOrdersFuturesOrderHistoryTableMobileRow
        v-for="order in derivativeStore.subaccountOrderHistory"
        :key="`${order.orderHash}-${order.cid}`"
        v-bind="{ order }"
      />
    </div>

    <template v-else>
      <PartialsPortfolioOrdersFuturesOrderHistoryTableRow
        v-for="order in derivativeStore.subaccountOrderHistory"
        :key="`${order.orderHash}-${order.cid}`"
        v-bind="{ order }"
      />
    </template>

    <CommonEmptyList
      v-if="derivativeStore.subaccountOrderHistory.length === 0"
      :message="'No Order History'"
    />
  </div>
</template>
