<script setup lang="ts">
import { Modal, BusEvents } from '@/types'

const modalStore = useSharedModalStore()
const { xs } = useSharedBreakpoints()

const isPurchaseFunds = ref(false)

function onPurchaseFunds() {
  isPurchaseFunds.value = true
}

function resetState() {
  isPurchaseFunds.value = false
}

useEventBus(BusEvents.OpenOnramper).on(async () => {
  await nextTick()
  onPurchaseFunds()
})
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.FiatOnboard]"
    v-bind="{ isSm: true, isHideCloseButton: !xs }"
    @on:open="resetState"
  >
    <PartialsOnboardingFiat
      v-if="!isPurchaseFunds"
      @funds:purchase="onPurchaseFunds"
    />

    <PartialsOnboardingFiatOnramper v-else />
  </AppModal>
</template>
