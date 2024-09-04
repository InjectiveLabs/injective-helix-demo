<script setup lang="ts">
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { Modal } from '@/types'

const modalStore = useModalStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { copy } = useClipboard()

const isModalOpen = computed(() => modalStore.modals[Modal.QrCode])

const formattedAddress = computed(() =>
  sharedEllipsisFormatText(sharedWalletStore.injectiveAddress, 12)
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
    is-dense
    class="p-4"
    @modal:closed="closeModal"
  >
    <section class="text-center">
      <SharedQRCode
        class="max-w-[280px] w-full mx-auto rounded-lg overflow-hidden mt-4"
        :text="sharedWalletStore.injectiveAddress"
      />

      <div class="flex items-center gap-2 max-w-[384px] mt-6">
        <p class="text-ellipsis overflow-hidden">
          {{ formattedAddress }}
        </p>
        <AppButton @click="onCopyAddress">{{ $t('common.copy') }}</AppButton>
      </div>
    </section>
  </AppModal>
</template>
