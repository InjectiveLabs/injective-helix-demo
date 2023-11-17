<script lang="ts" setup>
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Modal } from '@/types'

const modalStore = useModalStore()

defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    default: undefined
  },

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    default: undefined
  }
})

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
    <PartialsGridStrategySpotFormActiveStrategy
      v-if="strategy && market"
      v-bind="{ activeStrategy: strategy, market }"
    />
  </AppModal>
</template>
