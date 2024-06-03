<script lang="ts" setup>
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Modal, BusEvents, UiSpotMarket } from '@/types'

const spotStore = useSpotStore()
const modalStore = useModalStore()

const selectedMarket = ref<UiSpotMarket>()
const selectedStrategy = ref<TradingStrategy | undefined>()

onMounted(() => {
  useEventBus<TradingStrategy>(BusEvents.OpenTradingBotDetails).on(
    onOpenTradingBotDetails
  )
})

function onOpenTradingBotDetails(strategy: TradingStrategy) {
  selectedStrategy.value = strategy
  selectedMarket.value = spotStore.markets.find(
    (market) => market.marketId === strategy.marketId
  )

  if (selectedMarket && selectedStrategy) {
    modalStore.openModal(Modal.GridStrategyDetails)
  }
}
</script>

<template>
  <ModalsLiquidityGridStrategyDetails
    v-if="selectedMarket && selectedStrategy"
    v-bind="{ strategy: selectedStrategy, market: selectedMarket }"
  />
</template>
