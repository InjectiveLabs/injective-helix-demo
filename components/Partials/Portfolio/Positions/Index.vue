<script setup lang="ts">
import { PositionV2 } from '@injectivelabs/sdk-ts'
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

const selectedPosition = ref<PositionV2 | undefined>(undefined)

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
  <PartialsPortfolioPositionsTabs />

  <div class="overflow-x-auto lg:min-w-[1400px] divide-y border-b">
    <PartialsPositionsTable
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
