<script setup lang="ts">
const isMobile = useIsMobile()
const gridStrategyStore = useGridStrategyStore()

onWalletConnected(() => {
  gridStrategyStore.fetchAllStrategies()
})
</script>

<template>
  <div class="divide-y border-y">
    <div class="overflow-x-auto">
      <div class="lg:min-w-[1500px] divide-y border-b">
        <PartialsTradeSpotOrdersTradingBotsRunningTableHeader
          v-if="!isMobile"
        />

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
    </div>
    <PartialsLiquidityCommonTradingBotsModalTrigger />
  </div>
</template>
