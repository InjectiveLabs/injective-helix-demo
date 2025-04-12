<script setup lang="ts">
import { PositionV2 } from '@injectivelabs/sdk-ts'
import { Modal, BusEvents, MarketKey, UiDerivativeMarket } from '@/types'

const modalStore = useSharedModalStore()
const positionStore = usePositionStore()
const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const props = withDefaults(
  defineProps<{
    isTickerOnly?: boolean
  }>(),
  {}
)

const selectedPosition = ref<PositionV2 | undefined>(undefined)

const filteredPositions = computed(() =>
  positionStore.subaccountPositions.filter((position) => {
    if (props.isTickerOnly) {
      return position.marketId === market.value.marketId
    }

    return true
  })
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
  <PartialsPositionsTable
    v-if="filteredPositions.length"
    :positions="filteredPositions"
    :ui="{
      td: { color: 'dark:text-white' },
      th: { base: 'whitespace-nowrap dark:bg-coolGray-975' }
    }"
    @margin:add="addMargin"
    @tpsl:add="addTakeProfitStopLoss"
    @position:share="onSharePosition"
  />

  <CommonEmptyList
    v-if="!filteredPositions.length"
    :message="'No Open Positions'"
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
</template>
