<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useSharedModalStore()

const isPurchaseFunds = ref(false)

function onPurchaseFunds() {
  isPurchaseFunds.value = true
}

const isModalOpen = computed(() => modalStore.modals[Modal.FiatOnboard])

function closeModal() {
  isPurchaseFunds.value = false
  modalStore.closeModal(Modal.FiatOnboard)
}
</script>

<template>
  <AppModal
    v-bind="{
      isSm: true,
      isOpen: isModalOpen
    }"
    @modal:closed="closeModal"
  >
    <PartialsOnboardingFiat
      v-if="!isPurchaseFunds"
      @funds:purchase="onPurchaseFunds"
      @modal:close="closeModal"
    />

    <PartialsOnboardingFiatMercuryo v-else />
  </AppModal>
</template>
