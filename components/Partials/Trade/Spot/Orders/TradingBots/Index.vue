<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Modal, BusEvents, UiSpotMarket, GridStrategyTabs } from '@/types'

const spotStore = useSpotStore()
const modalStore = useModalStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const view = ref(GridStrategyTabs.Running)
const status = reactive(new Status(StatusType.Loading))

const selectedMarket = ref<UiSpotMarket>()
const selectedStrategy = ref<TradingStrategy | undefined>()

onWalletConnected(() => {
  useEventBus<TradingStrategy>(BusEvents.OpenTradingBotDetails).on(
    onOpenTradingBotDetails
  )
  fetchStrategies()
})

function fetchStrategies() {
  status.setLoading()

  gridStrategyStore
    .fetchAllStrategies()
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

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
  <div>
    <PartialsTradeSpotOrdersTradingBotsTabs
      v-model="view"
      @update:model-value="fetchStrategies"
    />

    <PartialsTradeSpotOrdersTradingBotsRunning
      v-if="view === GridStrategyTabs.Running"
    />
    <PartialsTradeSpotOrdersTradingBotsHistory v-else />

    <ModalsLiquidityGridStrategyDetails
      v-if="selectedMarket && selectedStrategy"
      v-bind="{ strategy: selectedStrategy, market: selectedMarket }"
    />
  </div>
</template>
