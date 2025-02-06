<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { PositionV2 } from '@injectivelabs/sdk-ts'
import {
  Modal,
  BusEvents,
  UiDerivativeMarket,
  PerpOrdersTradingBotsView
} from '@/types'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'

const modalStore = useSharedModalStore()
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
const selectedPosition = ref<PositionV2 | undefined>(undefined)
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

function addMargin(position: PositionV2) {
  selectedPosition.value = position
  modalStore.openModal(Modal.AddMarginToPosition)
}

function addTakeProfitStopLoss(position: PositionV2) {
  selectedPosition.value = position
  modalStore.openModal(Modal.AddTakeProfitStopLoss)
}

function onSharePosition(position: PositionV2) {
  selectedPosition.value = position
  modalStore.openModal(Modal.SharePositionPnl)
  useEventBus(BusEvents.SharePositionOpened).emit()
}
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
      is-trading-bots
      @margin:add="addMargin"
      @tpsl:add="addTakeProfitStopLoss"
      @position:share="onSharePosition"
    />

    <PartialsPortfolioOrdersFuturesOpenOrdersTable
      v-else-if="view === PerpOrdersTradingBotsView.OpenOrders"
      v-bind="{ orders: derivativeStore.subaccountOrders }"
      is-trading-bots
    />

    <PartialsPortfolioOrdersFuturesOrderHistoryTable
      v-else-if="view === PerpOrdersTradingBotsView.OrderHistory"
      v-bind="{ orders: derivativeStore.subaccountOrderHistory }"
    />

    <PartialsPortfolioOrdersFuturesTradeHistoryTable
      v-else-if="view === PerpOrdersTradingBotsView.TradeHistory"
      v-bind="{ trades: derivativeStore.subaccountTrades }"
    />

    <ModalsAddMargin
      v-if="selectedPosition"
      v-bind="{
        position: selectedPosition
      }"
    />

    <ModalsAddTakeProfitStopLoss
      v-if="selectedPosition"
      v-bind="{
        position: selectedPosition
      }"
    />

    <ModalsSharePositionPnl
      v-if="selectedPosition"
      v-bind="{ position: selectedPosition }"
    />
  </div>
</template>
