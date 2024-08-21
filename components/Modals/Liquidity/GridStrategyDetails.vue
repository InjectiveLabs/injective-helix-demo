<script lang="ts" setup>
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Modal, UiSpotMarket } from '@/types'

const modalStore = useModalStore()

withDefaults(
  defineProps<{ strategy?: TradingStrategy; market?: UiSpotMarket }>(),
  {
    strategy: undefined,
    market: undefined
  }
)

function onCloseModal() {
  modalStore.closeModal(Modal.GridStrategyDetails)
}
</script>
<template>
  <AppModal
    is-md
    :is-open="modalStore.modals[Modal.GridStrategyDetails]"
    @modal:closed="onCloseModal"
  >
    <PartialsLiquidityCommonActiveStrategy
      v-if="strategy && market"
      v-bind="{ activeStrategy: strategy, market }"
    />
  </AppModal>
</template>
