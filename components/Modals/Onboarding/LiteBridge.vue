<script setup lang="ts">
import { Modal } from '@/types'
enum View {
  Widget = 'widget',
  Processing = 'processing',
  Success = 'success'
}

const view = ref<View>(View.Widget)
const isAlwaysOpen = ref<boolean>(false)

const modalStore = useSharedModalStore()

const isModalOpen = computed(() => modalStore.modals[Modal.LiteBridge])

function closeModal() {
  modalStore.closeModal(Modal.LiteBridge)
}

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
  closeModal()
}
</script>

<template>
  <AppModal
    v-bind="{
      isSm: true,
      isOpen: isModalOpen,
      isAlwaysOpen: isAlwaysOpen
    }"
    @modal:closed="closeModal"
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
