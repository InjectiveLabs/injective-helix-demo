<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { SpotOrdersTradingBotsView } from '@/types'
import type { UiSpotMarket } from '@/types'

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
  if (!sharedWalletStore.address || !props.market) {
    return
  }

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
    spotStore.fetchOrderHistoryForSubaccount({
      subaccountId,
      filters: {
        marketIds: [props.market.marketId]
      },
      pagination: {
        limit: 100
      }
    }),
    spotStore.fetchTradesForSubaccount({
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

    <PartialsTradingBotsGridStrategiesRunningTable
      v-if="view === SpotOrdersTradingBotsView.ActiveStrategies"
    />

    <PartialsTradingBotsGridStrategiesHistoryTable
      v-else-if="view === SpotOrdersTradingBotsView.RemovedStrategies"
    />

    <PartialsPortfolioOrdersSpotOpenOrdersTable
      v-else-if="view === SpotOrdersTradingBotsView.Orders"
      is-trading-bots
      :orders="spotStore.subaccountOrders"
    />

    <PartialsPortfolioOrdersSpotOrderHistoryTable
      v-else-if="view === SpotOrdersTradingBotsView.OrderHistory"
      :orders="spotStore.subaccountOrderHistory"
    />

    <PartialsPortfolioOrdersSpotTradeHistoryTable
      v-else-if="view === SpotOrdersTradingBotsView.TradeHistory"
      :trades="spotStore.subaccountTrades"
    />
  </div>
</template>
