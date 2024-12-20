<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotOrdersTradingBotsView, UiSpotMarket } from '@/types'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'

const spotStore = useSpotStore()
const sharedWalletStore = useSharedWalletStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    market: UiSpotMarket
  }>(),
  {}
)

const view = ref(SpotOrdersTradingBotsView.ActiveStrategies)
const status = reactive(new Status(StatusType.Loading))

onWalletConnected(fetchStrategies)

function fetchStrategies() {
  status.setLoading()

  const subaccountId = addressAndMarketSlugToSubaccountId(
    sharedWalletStore.address,
    props.market.slug
  )

  Promise.all([
    gridStrategyStore.fetchAllStrategies(),
    spotStore.fetchOrdersBySubaccount({
      subaccountId,
      marketIds: [props.market.marketId]
    }),
    spotStore.fetchSubaccountOrderHistory({
      subaccountId,
      filters: {
        marketIds: [props.market.marketId]
      },
      pagination: {
        limit: 100
      }
    }),
    spotStore.fetchSubaccountTrades({
      subaccountId,
      filters: {
        marketIds: [props.market.marketId]
      }
    })
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

onUnmounted(() => {
  spotStore.resetSubaccount()
})
</script>

<template>
  <div>
    <PartialsTradeSpotOrdersTradingBotsHeader v-model="view" />

    <PartialsTradeSpotOrdersTradingBotsRunning
      v-if="view === SpotOrdersTradingBotsView.ActiveStrategies"
    />
    <PartialsTradeSpotOrdersTradingBotsHistory
      v-else-if="view === SpotOrdersTradingBotsView.RemovedStrategies"
    />

    <PartialsTradeSpotOrdersTradingBotsOpenOrders
      v-else-if="view === SpotOrdersTradingBotsView.Orders"
    />

    <PartialsTradeSpotOrdersTradingBotsOrderHistory
      v-else-if="view === SpotOrdersTradingBotsView.OrderHistory"
    />

    <PartialsTradeSpotOrdersTradingBotsTradeHistory
      v-else-if="view === SpotOrdersTradingBotsView.TradeHistory"
    />
  </div>
</template>
