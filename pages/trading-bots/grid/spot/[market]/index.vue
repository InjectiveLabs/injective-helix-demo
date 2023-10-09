<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Modal } from '@/types'

const modalStore = useModalStore()
const gridStrategyStore = useGridStrategyStore()

const selectedStrategy = ref<TradingStrategy>()
const selectedMarket = ref<UiSpotMarketWithToken>()

const activeStrategies = computed(() =>
  gridStrategyStore.strategies.filter(
    (strategy) =>
      strategy.state === 'active' &&
      strategy.marketId === gridStrategyStore.spotMarket?.marketId
  )
)

function setMarketAndStrategy(
  strategy: TradingStrategy,
  market: UiSpotMarketWithToken
) {
  selectedStrategy.value = strategy
  selectedMarket.value = market

  modalStore.openModal(Modal.GridStrategyDetails)
}
</script>

<template>
  <div class="bg-black h-full">
    <div v-if="activeStrategies.length > 0" class="min-w-[1100px]">
      <PartialsGridStrategySpotStrategiesRunningHeader />
    </div>

    <div class="min-w-[1100px] overflow-y-auto noScrollbar">
      <PartialsGridStrategySpotStrategiesRunningRow
        v-for="strategy in activeStrategies"
        :key="`strategy-${strategy.createdAt}`"
        v-bind="{ strategy }"
        @open:details="setMarketAndStrategy"
      />
    </div>

    <CommonEmptyList
      v-if="activeStrategies.length === 0"
      :message="'No Strategies Found'"
      class="h-full"
    />

    <ModalsGridStrategyDetails
      v-bind="{ market: selectedMarket, strategy: selectedStrategy }"
    />
  </div>
</template>

<style scoped>
.noScrollbar::-webkit-scrollbar {
  display: none;
}
</style>
