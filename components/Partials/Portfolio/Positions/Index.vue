<script setup lang="ts">
import { Modal, PositionsFilterField } from '@/types'
import type { PositionsFilterForm } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

const modalStore = useSharedModalStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const gridStrategyStore = useGridStrategyStore()
const { values } = useForm<PositionsFilterForm>()

const selectedPosition = ref<undefined | PositionV2>(undefined)

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

const hasActiveStrategy = computed(
  () =>
    !!gridStrategyStore.activeDerivativeStrategies.find(
      (strategy) => strategy.subaccountId === accountStore.subaccountId
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

function resetSelectedPosition() {
  selectedPosition.value = undefined
}
</script>

<template>
  <PartialsPortfolioPositionsTabs />

  <div class="overflow-x-auto divide-y border-b">
    <PartialsPositionsTable
      v-if="filteredPosition.length"
      :positions="filteredPosition"
      :is-trading-bots="hasActiveStrategy"
      @margin:add="addMargin"
      @tpsl:add="addTakeProfitStopLoss"
      @position:share="onSharePosition"
    />
  </div>

  <CommonEmptyList
    v-if="!filteredPosition.length"
    :message="$t('portfolio.noPositionsOpen')"
  />

  <ModalsAddMargin
    v-if="selectedPosition"
    v-bind="{ position: selectedPosition }"
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
</template>
