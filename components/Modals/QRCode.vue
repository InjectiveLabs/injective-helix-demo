<script setup lang="ts">
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { copy } = useClipboard()

const formattedAddress = computed(() =>
  sharedEllipsisFormatText(sharedWalletStore.injectiveAddress, 8)
)

function onCopyAddress() {
  copy(sharedWalletStore.address)
  notificationStore.success({ title: t('toast.copiedAddressToClipboard') })
}
</script>

<template>
  <AppModal v-model="modalStore.modals[Modal.QrCode]">
    <section class="text-center">
      <h3 class="mt-8">{{ $t('connect.qrTitle') }}</h3>
      <div class="max-w-[280px] mx-auto">
        <SharedQRCode
          class="w-full rounded-lg overflow-hidden mt-4"
          :text="sharedWalletStore.injectiveAddress"
        />

        <div class="flex items-center gap-2 mt-6 justify-between mx-auto">
          <p class="text-ellipsis overflow-hidden">{{ formattedAddress }}</p>
          <AppButton @click="onCopyAddress">{{ $t('common.copy') }}</AppButton>
        </div>
      </div>
    </section>
  </AppModal>
</template>
