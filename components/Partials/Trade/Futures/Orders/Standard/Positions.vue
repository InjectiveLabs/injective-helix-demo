<script setup lang="ts">
import { Position, PositionV2 } from '@injectivelabs/sdk-ts'
import { Modal } from '@/types'

const modalStore = useModalStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const isMobile = useIsMobile()

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
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioPositionsTableHeader v-if="!isMobile" />

    <div v-if="isMobile">
      <PartialsPortfolioPositionsTableMobileRow
        v-for="position in filteredPosition"
        :key="`${position.marketId}-${position.subaccountId}-${position.entryPrice}`"
        v-bind="{ position }"
        @margin:add="addMargin"
        @tpsl:add="addTakeProfitStopLoss"
      />
    </div>

    <template v-else>
      <PartialsPortfolioPositionsTableRow
        v-for="position in filteredPosition"
        :key="`${position.marketId}-${position.subaccountId}-${position.entryPrice}`"
        v-bind="{ position }"
        @margin:add="addMargin"
        @tpsl:add="addTakeProfitStopLoss"
      />
    </template>

    <CommonEmptyList
      v-if="filteredPosition.length === 0"
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
  </div>
</template>
