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

    <PartialsTradeSpotOrdersTradingBotsRunning
      v-if="view === SpotOrdersTradingBotsView.ActiveStrategies"
    />
    <PartialsTradeSpotOrdersTradingBotsHistory
      v-else-if="view === SpotOrdersTradingBotsView.RemovedStrategies"
    />

    <template v-if="view === SpotOrdersTradingBotsView.Orders">
      <PartialsPortfolioOrdersSpotOpenOrdersTable
        v-if="spotStore.subaccountOrders.length"
        :orders="spotStore.subaccountOrders"
        :is-trading-bots="true"
      />

      <CommonEmptyList
        v-if="!spotStore.subaccountOrders.length"
        v-bind="{ message: $t('trade.noOrders') }"
      />
    </template>

    <template v-else-if="view === SpotOrdersTradingBotsView.OrderHistory">
      <PartialsPortfolioOrdersSpotOrderHistoryTable
        v-if="spotStore.subaccountOrderHistory.length"
        :orders="spotStore.subaccountOrderHistory"
      />

      <CommonEmptyList
        v-if="!spotStore.subaccountOrderHistory.length"
        v-bind="{ message: $t('trade.noOrders') }"
      />
    </template>

    <template v-else-if="view === SpotOrdersTradingBotsView.TradeHistory">
      <PartialsPortfolioOrdersSpotTradeHistoryTable
        v-if="spotStore.subaccountTrades.length"
        :trades="spotStore.subaccountTrades"
      />

      <CommonEmptyList
        v-if="!spotStore.subaccountTrades.length"
        v-bind="{ message: $t('trade.noTrades') }"
      />
    </template>
  </div>
</template>
