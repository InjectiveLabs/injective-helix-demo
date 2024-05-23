<script setup lang="ts">
const gridStrategyStore = useGridStrategyStore()

const isMobile = useIsMobile()

onWalletConnected(() => {
  gridStrategyStore.fetchAllStrategies()
})
</script>

<template>
  <div class="divide-y border-y">
    <PartialsTradeSpotOrdersTradingBotsRunningTableHeader v-if="!isMobile" />

    <div v-if="isMobile">
      <PartialsTradeSpotOrdersTradingBotsRunningTableMobileRow
        v-for="strategy in gridStrategyStore.activeStrategies"
        v-bind="{ strategy }"
        :key="strategy.createdAt"
      />
    </div>

    <template v-else>
      <PartialsTradeSpotOrdersTradingBotsRunningTableRow
        v-for="strategy in gridStrategyStore.activeStrategies"
        v-bind="{ strategy }"
        :key="strategy.createdAt"
      />
    </template>

    <CommonEmptyList
      v-if="gridStrategyStore.activeStrategies.length === 0"
      :message="$t('sgt.noActiveStrategies')"
    />
  </div>
</template>
