<script setup lang="ts">
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { usdtToken } from '@shared/data/token'
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { copy } = useClipboard()

const isModalOpen = computed(() => modalStore.modals[Modal.DepositQr])

const formattedAddress = computed(() =>
  sharedEllipsisFormatText(sharedWalletStore.injectiveAddress, 8)
)

function closeModal() {
  modalStore.closeModal(Modal.DepositQr)
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
      <h3 class="-mt-4">{{ $t('account.qrDeposit.title') }}</h3>

      <div class="max-w-[308px] mx-auto mt-6">
        <SharedQRCode
          class="w-full rounded-lg overflow-hidden"
          :text="sharedWalletStore.injectiveAddress"
          color="#40A9FF"
        />

        <div class="flex items-center gap-2 mt-6 justify-between">
          <p class="text-ellipsis overflow-hidden">{{ formattedAddress }}</p>
          <AppButton @click="onCopyAddress">
            {{ $t('common.copy') }}
          </AppButton>
        </div>
      </div>

      <div class="mt-4">
        <i18n-t keypath="account.qrDeposit.ctaLink">
          <template #link>
            <PartialsCommonBridgeRedirection
              :denom="usdtToken.denom"
              class="text-blue-550 hover:text-opacity-80"
            >
              {{ $t('common.here') }}
            </PartialsCommonBridgeRedirection>
          </template>
        </i18n-t>
      </div>
    </section>
  </AppModal>
</template>
