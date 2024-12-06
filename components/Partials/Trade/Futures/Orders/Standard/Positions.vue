<script setup lang="ts">
import { Position, PositionV2 } from '@injectivelabs/sdk-ts'
import { Modal, BusEvents } from '@/types'

const modalStore = useSharedModalStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()

const selectedPosition = ref<Position | PositionV2 | undefined>(undefined)

const filteredPosition = computed(() =>
  positionStore.subaccountPositions.filter((position) => {
    const isPartOfSubaccount =
      position.subaccountId === accountStore.subaccountId

    return isPartOfSubaccount
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
  <div class="divide-y">
    <PartialsPortfolioPositionsTable
      v-if="filteredPosition.length"
      :positions="filteredPosition"
      :ui="{
        th: {
          base: 'whitespace-nowrap dark:bg-coolGray-975'
        },
        td: {
          font: 'font-mono',
          color: 'dark:text-white'
        }
      }"
      @margin:add="addMargin"
      @tpsl:add="addTakeProfitStopLoss"
      @position:share="onSharePosition"
    />

    <CommonEmptyList
      v-if="!filteredPosition.length"
      :message="'No Open Positions'"
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
  </div>
</template>
