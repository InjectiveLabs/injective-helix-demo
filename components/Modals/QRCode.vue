<script setup lang="ts">
import { toDataURL } from 'qrcode'
import { Modal } from '@/types'

const modalStore = useModalStore()
const walletStore = useWalletStore()

const isModalOpen = computed(() => modalStore.modals[Modal.QrCode])

function closeModal() {
  modalStore.closeModal(Modal.QrCode)
}

watch(
  () => isModalOpen.value,
  (isOpen) => {
    if (isOpen) {
      const canvasEl = document.getElementById('qrCodeCanvas') as
        | HTMLCanvasElement
        | undefined

      if (canvasEl) {
        toDataURL(canvasEl, walletStore.injectiveAddress, {
          width: canvasEl.width
        })
      }
    }
  },
  { immediate: true, flush: 'post' }
)
</script>

<template>
  <AppModal :is-open="isModalOpen" @modal:closed="closeModal">
    <template #title>
      <h3>{{ $t('common.qrCode') }}</h3>
    </template>

    <div class="max-sm:pt-10">
      <p class="break-words mb-4">{{ walletStore.injectiveAddress }}</p>
      <canvas id="qrCodeCanvas" class="mx-auto rounded-md" />
    </div>
  </AppModal>
</template>
