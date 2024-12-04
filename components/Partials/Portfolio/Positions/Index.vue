<script setup lang="ts">
import { Position, PositionV2 } from '@injectivelabs/sdk-ts'
import {
  Modal,
  BusEvents,
  PositionsFilterField,
  PositionsFilterForm
} from '@/types'

const modalStore = useSharedModalStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()

const { values } = useForm<PositionsFilterForm>()

const selectedPosition = ref<Position | PositionV2 | undefined>(undefined)

const filteredPosition = computed(() =>
  positionStore.positions.filter((position) => {
    const isPartOfMarket = values[PositionsFilterField.Market]
      ? position.marketId === values[PositionsFilterField.Market]
      : true

    const isPartOfSide = values[PositionsFilterField.Side]
      ? position.direction === values[PositionsFilterField.Side]
      : true

    const isPartOfSubaccount =
      position.subaccountId === accountStore.subaccountId

    return isPartOfMarket && isPartOfSide && isPartOfSubaccount
  })
)

const positionToAddMargin = ref<Position | PositionV2 | undefined>(undefined)

function addMargin(position: Position | PositionV2) {
  modalStore.openModal(Modal.AddMarginToPosition)

  positionToAddMargin.value = position
}

function addTakeProfitStopLoss(position: Position | PositionV2) {
  modalStore.openModal(Modal.AddTakeProfitStopLoss)

  positionToAddMargin.value = position
}

function onSharePosition(position: Position | PositionV2) {
  selectedPosition.value = position
  modalStore.openModal(Modal.SharePositionPnl)
  useEventBus(BusEvents.SharePositionOpened).emit()
}
</script>

<template>
  <PartialsPortfolioPositionsTabs />

  <div class="overflow-x-auto lg:min-w-[1400px] divide-y border-b">
    <PartialsPortfolioPositionsTable
      v-if="filteredPosition.length"
      :positions="filteredPosition"
      @margin:add="addMargin"
      @tpsl:add="addTakeProfitStopLoss"
      @position:share="onSharePosition"
    />
  </div>

  <CommonEmptyList
    v-if="!filteredPosition.length"
    :message="'No Positions Open'"
  />

  <ModalsAddMargin
    v-bind="{
      position: positionToAddMargin
    }"
  />

  <ModalsAddTakeProfitStopLoss
    v-bind="{
      position: positionToAddMargin
    }"
  />

  <ModalsSharePositionPnl
    v-if="selectedPosition"
    v-bind="{ position: selectedPosition }"
  />
</template>
