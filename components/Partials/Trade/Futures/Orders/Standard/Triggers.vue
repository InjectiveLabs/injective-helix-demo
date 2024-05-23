<script setup lang="ts">
const derivativeStore = useDerivativeStore()
const isMobile = useIsMobile()
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersFuturesTriggersTableHeader v-if="!isMobile" />

    <div v-if="isMobile">
      <PartialsPortfolioOrdersFuturesTriggersTableMobileRow
        v-for="trigger in derivativeStore.subaccountConditionalOrders"
        :key="`${trigger.orderHash}-${trigger.cid}`"
        v-bind="{ trigger }"
      />
    </div>

    <template v-else>
      <PartialsPortfolioOrdersFuturesTriggersTableRow
        v-for="trigger in derivativeStore.subaccountConditionalOrders"
        :key="`${trigger.orderHash}-${trigger.cid}`"
        v-bind="{ trigger }"
      />
    </template>

    <CommonEmptyList
      v-if="derivativeStore.subaccountConditionalOrders.length === 0"
      :message="'No Triggers Found'"
    />
  </div>
</template>
