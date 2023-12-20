<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()

defineProps({
  cta: Boolean
})

function onConnect() {
  modalStore.openModal(Modal.Connect)
}
</script>

<template>
  <div
    class="flex h-full w-full items-center justify-center text-center"
    data-cy="wallet-not-connected-modal-warning"
  >
    <div v-if="cta" class="text-center py-4">
      <p class="text-xs text-gray-300 w-full">
        {{ $t('connect.pleaseConnectToYourWallet') }}
      </p>
      <AppButton
        class="bg-blue-500 text-blue-900 font-semibold mt-2"
        data-cy="wallet-not-connected-warning-modal-connect-button"
        @click="onConnect"
      >
        {{ $t('connect.connect') }}
      </AppButton>
    </div>
    <p v-else class="text-xs text-gray-400 py-4">
      {{ $t('connect.pleaseConnectToYourWalletCta') }}
    </p>
  </div>
</template>
