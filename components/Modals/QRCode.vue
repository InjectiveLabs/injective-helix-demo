<script setup lang="ts">
import { Modal } from '@/types'

const modalStore = useModalStore()
const sharedWalletStore = useSharedWalletStore()

const isModalOpen = computed(() => modalStore.modals[Modal.QrCode])

function closeModal() {
  modalStore.closeModal(Modal.QrCode)
}
</script>

<template>
  <AppModal :is-open="isModalOpen" @modal:closed="closeModal">
    <template #title>
      <h3>{{ $t('common.qrCode') }}</h3>
    </template>

    <section class="text-center pb-4">
      <p class="text-sm font-semibold mb-4">
        {{ sharedWalletStore.injectiveAddress }}
      </p>
      <SharedQRCode
        class="max-w-[80%] w-full mx-auto rounded-lg"
        :text="sharedWalletStore.injectiveAddress"
      />

      <!-- <div class="max-sm:pt-10">
        <p class="break-words mb-4">{{ walletStore.injectiveAddress }}</p>
        <canvas id="qrCodeCanvas" class="mx-auto rounded-md" />
      </div> -->
    </section>
  </AppModal>
</template>
