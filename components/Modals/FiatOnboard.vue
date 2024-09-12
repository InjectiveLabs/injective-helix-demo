<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useModalStore()

const isPurchaseFunds = ref(false)

const isModalOpen = computed(() => modalStore.modals[Modal.FiatOnboard])

function onCloseModal() {
  modalStore.closeModal(Modal.FiatOnboard)
  isPurchaseFunds.value = false
}

function onPurchaseFunds() {
  isPurchaseFunds.value = true
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
    <PartialsOnboardingFiat
      v-if="!isPurchaseFunds"
      @funds:purchase="onPurchaseFunds"
    />

    <PartialsOnboardingFiatMercuryo v-else />
  </AppModal>
</template>
