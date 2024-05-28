<script setup lang="ts">
import { Position, PositionV2 } from '@injectivelabs/sdk-ts'
import { Modal, PositionsFilterField, PositionsFilterForm } from '@/types'

const modalStore = useModalStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()

const { values } = useForm<PositionsFilterForm>()
const isMobile = useIsMobile()

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
</script>

<template>
  <PartialsPortfolioPositionsTabs />

  <div class="overflow-x-auto">
    <div class="lg:min-w-[1700px] divide-y border-b">
      <PartialsPortfolioPositionsTableHeader v-if="!isMobile" />

      <template v-if="isMobile">
        <PartialsPortfolioPositionsTableMobileRow
          v-for="position in filteredPosition"
          :key="`${position.marketId}-${position.subaccountId}`"
          v-bind="{ position }"
          @margin:add="addMargin"
          @tpsl:add="addTakeProfitStopLoss"
        />
      </template>

      <template v-else>
        <PartialsPortfolioPositionsTableRow
          v-for="position in filteredPosition"
          :key="`${position.marketId}-${position.subaccountId}`"
          v-bind="{ position }"
          @margin:add="addMargin"
          @tpsl:add="addTakeProfitStopLoss"
        />
      </template>
    </div>
  </div>

  <CommonEmptyList
    v-if="filteredPosition.length === 0"
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
</template>
