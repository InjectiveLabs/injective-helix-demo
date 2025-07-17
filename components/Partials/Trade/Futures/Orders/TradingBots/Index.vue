<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { Modal, PerpOrdersTradingBotsView } from '@/types'
import type { UiDerivativeMarket } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

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
const selectedPosition = ref<undefined | PositionV2>(undefined)
const { $onError } = useNuxtApp()

onWalletConnected(fetchStrategies)

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
}

function fetchStrategies() {
  if (!sharedWalletStore.address) {
    return
  }

  status.setLoading()

  Promise.all([
    gridStrategyStore.fetchAllStrategies(),
    positionStore.fetchPositions(),
    derivativeStore.fetchSecondarySubaccountOrders({
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

function resetSelectedPosition() {
  selectedPosition.value = undefined
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

    <PartialsPositionsTable
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
      v-bind="{ position: selectedPosition }"
      is-pgt
    />

    <ModalsAddTakeProfitStopLoss
      v-if="selectedPosition"
      v-bind="{ position: selectedPosition }"
      @on:close="resetSelectedPosition"
    />

    <ModalsSharePositionPnl
      v-if="selectedPosition"
      v-bind="{ position: selectedPosition }"
      @on:close="resetSelectedPosition"
    />
  </div>
</template>
