<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { Modal } from '@/types'
import {
  addDesktopAddress,
  getMobileAddress,
  CONNECT_SERVER_URL
} from '@/app/client/connectMobile'

const tradingMessages = [
  MsgType.MsgCreateSpotLimitOrder,
  MsgType.MsgCreateSpotMarketOrder,
  MsgType.MsgCreateDerivativeLimitOrder,
  MsgType.MsgCreateDerivativeMarketOrder,
  MsgType.MsgCancelSpotOrder,
  MsgType.MsgCancelDerivativeOrder,
  MsgType.MsgBatchCancelDerivativeOrders,
  MsgType.MsgBatchCancelSpotOrders,
  MsgType.MsgBatchCreateDerivativeLimitOrders,
  MsgType.MsgBatchCreateSpotLimitOrders,
  MsgType.MsgBatchUpdateOrders
]

const modalStore = useModalStore()
const sharedWalletStore = useSharedWalletStore()
const authZStore = useAuthZStore()
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()

const isModalOpen = computed(() => modalStore.modals[Modal.ConnectMobile])

const isInitialized = ref(false)
const mobileAddress = ref<string | null>(null)

function closeModal() {
  modalStore.closeModal(Modal.ConnectMobile)
}

async function initServerConnection() {
  const result = await addDesktopAddress({
    desktopAddress: sharedWalletStore.injectiveAddress
  })

  if (result?.status === 200) {
    isInitialized.value = true
  }
}

watch(isInitialized, (val: boolean) => {
  if (val) {
    const _interval = setInterval(async () => {
      const result = await getMobileAddress({
        desktopAddress: sharedWalletStore.injectiveAddress
      })
      if (result?.data?.mobileAddress) {
        mobileAddress.value = result.data.mobileAddress
        clearInterval(_interval)
      }
    }, 2000)
  }
})

watch(isModalOpen, (val: boolean) => {
  if (val) {
    initServerConnection()
  }
})

function grantAuthorization() {
  authZStore
    .grantAuthorization({
      grantee: mobileAddress.value,
      messageTypes: tradingMessages
    })
    .then(() => {
      closeModal()
      return notificationStore.success({ title: t('common.success') })
    })
    .catch($onError)
}

const qrCodeText = JSON.stringify({
  granter: sharedWalletStore.injectiveAddress,
  endpoint: CONNECT_SERVER_URL,
  postUrl: `${CONNECT_SERVER_URL}/helix-connect/mobile`
})
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
        :text="qrCodeText"
      />

      <div class="flex items-center gap-2 max-w-[384px] mt-6 pb-3">
        <p class="text-ellipsis overflow-hidden">
          Scan this QR code in Helix Mobile to connect your wallet!
        </p>
      </div>
      <AppButton
        v-bind="{ status }"
        :disabled="!mobileAddress"
        class="w-full"
        variant="primary"
        @click="grantAuthorization"
      >
        {{ mobileAddress ? 'Grant Access' : 'Scan Code to Continue' }}
      </AppButton>
    </section>
  </AppModal>
</template>
