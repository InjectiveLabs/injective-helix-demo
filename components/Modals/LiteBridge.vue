<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useModalStore()

const isModalOpen = computed(() => modalStore.modals[Modal.LiteBridge])

function onCloseModal() {
  modalStore.closeModal(Modal.LiteBridge)
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
    <PartialsOnboardingLiteBridgeWidget />

    <PartialsOnboardingLiteBridgeWidgetProcessing v-if="false" />
    <PartialsOnboardingLiteBridgeWidgetSuccess v-if="false" />
  </AppModal>
</template>
