<script setup lang="ts">
import { Modal } from '@/types'

enum View {
  Widget = 'widget',
  Success = 'success',
  Processing = 'processing'
}

const modalStore = useSharedModalStore()

const isFiatPurchase = ref(false)
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
  modalStore.closeModal(Modal.Onboard)
}

function onSelectFiatPurchase() {
  isFiatPurchase.value = true
}

function resetFiatPurchase() {
  isFiatPurchase.value = false
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.Onboard]"
    v-bind="{ isAlwaysOpen }"
    @on:open="resetFiatPurchase"
  >
    <template v-if="!isFiatPurchase">
      <h4 class="text-xl font-semibold mt-6 mb-8 text-center">
        {{ $t('common.modal.onboarding.depositUsdtFromEthereum') }}
      </h4>

      <PartialsOnboardingLiteBridgeWidget
        v-if="view === View.Widget"
        @on:success="onSuccess"
        @fiat:select="onSelectFiatPurchase"
      />

      <PartialsOnboardingLiteBridgeWidgetProcessing
        v-if="view === View.Processing"
        @on:close="onCloseAlwaysOpen"
        @transfer:success="onTransferSuccess"
      />

      <PartialsOnboardingLiteBridgeWidgetSuccess v-if="view === View.Success" />
    </template>

    <PartialsOnboardingFiatOnramper v-else />
  </AppModal>
</template>
