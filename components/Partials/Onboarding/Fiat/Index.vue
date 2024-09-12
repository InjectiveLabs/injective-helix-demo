<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useModalStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { copy } = useClipboard()
const { t } = useI18n()

const emit = defineEmits<{
  'funds:purchase': []
}>()

function onCloseModal() {
  modalStore.closeModal(Modal.FiatOnboard)
}

function onPurchaseFunds() {
  emit('funds:purchase')
}

function onCopyInjectiveAddress() {
  copy(sharedWalletStore.injectiveAddress)
  notificationStore.success({ title: t('connect.copiedAddress') })
}
</script>

<template>
  <div class="text-center">
    <h2 class="font-semibold text-xl">
      {{ $t('onboarding.fundsNeeded') }}
    </h2>

    <p class="text-sm mt-4">
      {{ $t('onboarding.fundsNeededDescription') }}
    </p>

    <SharedQRCode
      class="max-w-[280px] w-full mx-auto rounded-lg overflow-hidden mt-8"
      text="Ivan"
    />

    <p class="mt-8">
      {{ $t('onboarding.scanQrCodeOrCopy') }}
    </p>

    <div class="flex items-center gap-2 rounded-lg border p-2">
      <p class="truncate">{{ sharedWalletStore.injectiveAddress }}</p>
      <AppButton variant="primary-outline" @click="onCopyInjectiveAddress">
        {{ $t('onboarding.copy') }}
      </AppButton>
    </div>

    <div class="grid grid-cols-1 gap-2 mt-4">
      <AppButton class="w-full" @click="onPurchaseFunds">
        {{ $t('onboarding.iNeedToPurchaseFunds') }}
      </AppButton>

      <AppButton
        variant="primary-ghost"
        class="w-full text-gray-400 hover:text-white"
        @click="onCloseModal"
      >
        {{ $t('onboarding.imDone') }}
      </AppButton>
    </div>
  </div>
</template>
