<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { PerpOrdersTradingBotsView, UiDerivativeMarket } from '@/types'
import { addressAndMarketSlugToSubaccountId } from '~/app/utils/helpers'

const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()
const gridStrategyStore = useGridStrategyStore()

const props = withDefaults(
  defineProps<{
    market: UiDerivativeMarket
  }>(),
  {}
)

const view = ref(PerpOrdersTradingBotsView.ActiveStrategies)
const status = reactive(new Status(StatusType.Loading))
const { $onError } = useNuxtApp()

onWalletConnected(fetchStrategies)

function fetchStrategies() {
  status.setLoading()

  Promise.all([
    gridStrategyStore.fetchAllStrategies(),
    positionStore.fetchPositions(),
    derivativeStore.fetchOrdersForSubaccount({
      marketIds: [props.market.marketId],
      subaccountId: pgtSubaccount.value
    }),
    derivativeStore.fetchOrderHistoryForSubaccount({
      subaccountId: pgtSubaccount.value
    }),
    derivativeStore.fetchTradesForSubaccount({
      subaccountId: pgtSubaccount.value
    })
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

const pgtSubaccount = computed(() =>
  addressAndMarketSlugToSubaccountId(
    sharedWalletStore.address,
    props.market.slug
  )
)

const positions = computed(() =>
  positionStore.positions.filter(
    ({ subaccountId }) => subaccountId === pgtSubaccount.value
  )
)
</script>

<template>
  <div>
    <PartialsTradeFuturesOrdersTradingBotsHeader
      v-bind="{
        positionsLength: positions.length
      }"
      v-model="view"
    />

    <PartialsTradingBotsGridStrategiesRunningTable
      v-if="view === PerpOrdersTradingBotsView.ActiveStrategies"
    />

    <PartialsTradingBotsGridStrategiesHistoryTable
      v-else-if="view === PerpOrdersTradingBotsView.RemovedStrategies"
    />

    <PartialsPortfolioPositionsTable
      v-else-if="view === PerpOrdersTradingBotsView.Positions"
      v-bind="{ positions }"
    />

    <PartialsPortfolioOrdersFuturesOpenOrdersTable
      v-else-if="view === PerpOrdersTradingBotsView.OpenOrders"
      v-bind="{ orders: derivativeStore.subaccountOrders }"
    />

    <PartialsPortfolioOrdersFuturesOrderHistoryTable
      v-else-if="view === PerpOrdersTradingBotsView.OrderHistory"
      v-bind="{ orders: derivativeStore.subaccountOrderHistory }"
    />

    <PartialsPortfolioOrdersFuturesTradeHistoryTable
      v-else-if="view === PerpOrdersTradingBotsView.TradeHistory"
      v-bind="{ trades: derivativeStore.subaccountTrades }"
    />
  </div>
</template>
