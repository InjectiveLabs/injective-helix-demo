<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const { xs } = useSharedBreakpoints()

const isPurchaseFunds = ref(false)

function onPurchaseFunds() {
  isPurchaseFunds.value = true
}

function closeModal() {
  isPurchaseFunds.value = false
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.FiatOnboard]"
    v-bind="{ isHideCloseButton: !xs }"
    @on:close="closeModal"
  >
    <PartialsOnboardingFiat
      v-if="!isPurchaseFunds"
      @funds:purchase="onPurchaseFunds"
      @modal:close="closeModal"
    />

    <PartialsOnboardingFiatMercuryo v-else />
  </AppModal>
</template>
