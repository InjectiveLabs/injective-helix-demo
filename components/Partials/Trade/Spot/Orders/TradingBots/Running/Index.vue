<script setup lang="ts">
const isMobile = useIsMobile()
const gridStrategyStore = useGridStrategyStore()
</script>

<template>
  <div class="divide-y border-b">
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
