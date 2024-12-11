<script setup lang="ts">
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { copy } = useClipboard()

const isModalOpen = computed(() => modalStore.modals[Modal.QrCode])

const formattedAddress = computed(() =>
  sharedEllipsisFormatText(sharedWalletStore.injectiveAddress, 8)
)

function closeModal() {
  modalStore.closeModal(Modal.QrCode)
}

function onCopyAddress() {
  copy(sharedWalletStore.address)
  notificationStore.success({ title: t('connect.copiedAddress') })
}
</script>

<template>
  <AppModal
    :is-open="isModalOpen"
    is-sm
    is-dense
    class="p-4"
    @modal:closed="closeModal"
  >
    <section class="text-center">
      <h3 class="-mt-4">{{ $t('connect.qrTitle') }}</h3>
      <div class="max-w-[280px] mx-auto">
        <SharedQRCode
          class="w-full rounded-lg overflow-hidden mt-4"
          :text="sharedWalletStore.injectiveAddress"
          color="#40A9FF"
        />

        <div class="flex items-center gap-2 mt-6 justify-between mx-auto">
          <p class="text-ellipsis overflow-hidden">{{ formattedAddress }}</p>
          <AppButton @click="onCopyAddress">{{ $t('common.copy') }}</AppButton>
        </div>
      </div>
    </section>
  </AppModal>
</template>
