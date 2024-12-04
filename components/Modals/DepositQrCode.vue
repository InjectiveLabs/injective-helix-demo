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
  sharedEllipsisFormatText(sharedWalletStore.injectiveAddress, 4)
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
      <SharedQRCode
        class="max-w-[280px] w-full mx-auto rounded-lg overflow-hidden mt-4"
        :text="sharedWalletStore.injectiveAddress"
        color="#0082FA"
      />

      <div
        class="flex items-center gap-2 max-w-[264px] mt-6 justify-between mx-auto"
      >
        <p class="text-ellipsis overflow-hidden">{{ formattedAddress }}</p>
        <AppButton @click="onCopyAddress">{{ $t('common.copy') }}</AppButton>
      </div>
      <div class="mt-4">
        <!-- <p>{{ $t('account.qrDeposit.description') }}</p> -->
        <i18n-t keypath="account.qrDeposit.ctaLink">
          <template #link>
            <PartialsCommonBridgeRedirection
              :denom="usdtToken.denom"
              class="text-blue-550 hover:text-opacity-80"
            >
              {{ $t('account.qrDeposit.link') }}
            </PartialsCommonBridgeRedirection>
          </template>
        </i18n-t>
      </div>
    </section>
  </AppModal>
</template>
