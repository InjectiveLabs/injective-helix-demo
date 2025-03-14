<script setup lang="ts">
import { Modal } from '@/types'

enum View {
  Widget = 'widget',
  Processing = 'processing',
  Success = 'success'
}

const modalStore = useSharedModalStore()

const view = ref<View>(View.Widget)
const isAlwaysOpen = ref<boolean>(false)

function onSuccess() {
  view.value = View.Processing
  isAlwaysOpen.value = true
}

function onTransferSuccess() {
  view.value = View.Success
  isAlwaysOpen.value = false
}

function onCloseAlwaysOpen() {
  view.value = View.Widget
  isAlwaysOpen.value = false
  modalStore.closeModal(Modal.LiteBridge)
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.LiteBridge]"
    v-bind="{ isAlwaysOpen }"
  >
    <PartialsOnboardingLiteBridgeWidget
      v-if="view === View.Widget"
      @success="onSuccess"
    />

    <PartialsOnboardingLiteBridgeWidgetProcessing
      v-if="view === View.Processing"
      @transfer:success="onTransferSuccess"
      @close="onCloseAlwaysOpen"
    />

    <PartialsOnboardingLiteBridgeWidgetSuccess v-if="view === View.Success" />
  </AppModal>
</template>
