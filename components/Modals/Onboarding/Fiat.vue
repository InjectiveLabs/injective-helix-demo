<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useSharedModalStore()

const isPurchaseFunds = ref(false)

function onPurchaseFunds() {
  isPurchaseFunds.value = true
}

function closeModal() {
  isPurchaseFunds.value = false
}
</script>

<template>
  <SharedModal
    v-model="modalStore.modals[Modal.FiatOnboard]"
    @modal:closed="closeModal"
  >
    <PartialsOnboardingFiat
      v-if="!isPurchaseFunds"
      @funds:purchase="onPurchaseFunds"
      @modal:close="closeModal"
    />

    <PartialsOnboardingFiatMercuryo v-else />
  </SharedModal>
</template>
