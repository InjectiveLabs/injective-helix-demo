<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Modal } from '@/types'

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

const modalStore = useModalStore()

function closeModal() {
  modalStore.closeModal(Modal.GridStrategyDetails)
}
</script>
<template>
  <AppModal
    md
    :is-open="modalStore.modals[Modal.GridStrategyDetails]"
    @modal:closed="closeModal"
  >
    <PartialsGridStrategySpotFormActiveStrategy
      v-if="strategy && market"
      v-bind="{ activeStrategy: strategy, market }"
    />
  </AppModal>
</template>
