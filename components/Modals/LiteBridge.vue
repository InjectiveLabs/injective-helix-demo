<script setup lang="ts">
import { Modal } from '@/types'

type View = 'widget' | 'processing' | 'success'

const modalStore = useModalStore()

const view = ref<View>('widget')

const isModalOpen = computed(() => modalStore.modals[Modal.LiteBridge])

function onCloseModal() {
  modalStore.closeModal(Modal.LiteBridge)
}

function onSuccess() {
  view.value = 'processing'
}

function onTransferSuccess() {
  view.value = 'success'
}
</script>

<template>
  <AppModal
    v-bind="{
      isSm: true,
      isOpen: isModalOpen
    }"
    @modal:closed="onCloseModal"
  >
    <PartialsOnboardingLiteBridgeWidget
      v-if="view === 'widget'"
      @success="onSuccess"
    />

    <PartialsOnboardingLiteBridgeWidgetProcessing
      v-if="view === 'processing'"
      @transfer:success="onTransferSuccess"
    />
    <PartialsOnboardingLiteBridgeWidgetSuccess v-if="view === 'success'" />
  </AppModal>
</template>
