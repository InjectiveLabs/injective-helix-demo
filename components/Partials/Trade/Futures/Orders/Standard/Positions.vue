<script lang="ts" setup>
import { Modal, MarketKey } from '@/types'
import type { UiDerivativeMarket } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

const modalStore = useSharedModalStore()
const positionStore = usePositionStore()
const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const props = withDefaults(
  defineProps<{
    isTickerOnly?: boolean
  }>(),
  {}
)

const selectedPosition = ref<undefined | PositionV2>(undefined)

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
}

function resetSelectedPosition() {
  selectedPosition.value = undefined
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
    :message="$t('trade.noOpenPositions')"
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
