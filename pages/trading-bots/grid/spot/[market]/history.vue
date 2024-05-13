<script lang="ts" setup>
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Modal, UiSpotMarket } from '@/types'

const modalStore = useModalStore()
const gridStrategyStore = useGridStrategyStore()

const selectedStrategy = ref<TradingStrategy>()
const selectedMarket = ref<UiSpotMarket>()

function setMarketAndStrategy(strategy: TradingStrategy, market: UiSpotMarket) {
  selectedStrategy.value = strategy
  selectedMarket.value = market

  modalStore.openModal(Modal.GridStrategyDetails)
}
</script>

<template>
  <div class="bg-black h-full">
    <div
      v-if="gridStrategyStore.removedStrategies.length > 0"
      class="min-w-[1100px]"
    >
      <PartialsGridStrategySpotStrategiesHistoryHeader />
    </div>

    <div class="min-w-[1100px] overflow-y-auto noScrollbar bg-black">
      <PartialsGridStrategySpotStrategiesHistoryRow
        v-for="strategy in gridStrategyStore.removedStrategies"
        :key="`strategy-${strategy.createdAt}`"
        v-bind="{ strategy }"
        @details:open="setMarketAndStrategy"
      />
    </div>

    <CommonEmptyList
      v-if="gridStrategyStore.removedStrategies.length === 0"
      :message="$t('sgt.noStrategiesFound')"
      class="h-full"
    />

    <ModalsLiquidityGridStrategyDetails
      v-bind="{ market: selectedMarket, strategy: selectedStrategy }"
    />
  </div>
</template>

<style scoped>
.noScrollbar::-webkit-scrollbar {
  display: none;
}
</style>
