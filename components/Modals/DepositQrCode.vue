<script setup lang="ts">
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { usdtToken } from '@shared/data/token'
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
  notificationStore.success({ title: t('connect.copiedAddress') })
}
</script>

<template>
  <AppModal v-model="modalStore.modals[Modal.DepositQr]">
    <section class="text-center">
      <h3 class="mt-8 text-white">{{ $t('account.qrDeposit.title') }}</h3>

      <div class="max-w-[308px] mx-auto mt-6">
        <SharedQRCode
          class="w-full rounded-lg overflow-hidden"
          :text="sharedWalletStore.injectiveAddress"
        />

        <div class="flex items-center gap-2 mt-6 justify-between">
          <p class="text-ellipsis overflow-hidden text-white font-medium">
            {{ formattedAddress }}
          </p>
          <AppButton
            class="py-2 border-none text-base leading-5"
            @click="onCopyAddress"
          >
            {{ $t('common.copy') }}
          </AppButton>
        </div>
      </div>

      <div
        class="mt-8 flex flex-col justify-center items-center space-y-4 w-full"
      >
        <div class="text-white text-sm font-medium leading-[18px]">
          {{ $t('account.qrDeposit.cta') }}
        </div>

        <PartialsCommonBridgeRedirection
          :denom="usdtToken.denom"
          class="w-full"
        >
          <AppButton
            variant="primary-outline"
            class="w-full text-white hover:text-white text-base leading-5 py-2.5"
          >
            {{ $t('account.qrDeposit.bridge') }}
          </AppButton>
        </PartialsCommonBridgeRedirection>
      </div>
    </section>
  </AppModal>
</template>
