<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { Status, StatusType } from '@injectivelabs/utils'
import { TRADING_MESSAGES } from '@/app/data/trade'
import {
  addDesktopAddress,
  getMobileAddress
} from '@/app/services/connectMobile'
import { CONNECT_SERVER_URL } from '@/app/utils/constants'
import { BusEvents, Modal } from '@/types'

const modalStore = useSharedModalStore()
const authZStore = useAuthZStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()

const { t } = useLang()
const { $onError } = useNuxtApp()

const qrCodeText = JSON.stringify({
  granter: sharedWalletStore.injectiveAddress,
  endpoint: CONNECT_SERVER_URL,
  postUrl: `${CONNECT_SERVER_URL}/helix-connect/mobile`
})

const tradingMessages = [
  ...TRADING_MESSAGES,
  MsgType.MsgExecuteContractCompat,
  MsgType.MsgSend
]

const status = reactive(new Status(StatusType.Idle))
const mobileAddress = ref()

const isModalOpen = computed(() => modalStore.modals[Modal.ConnectMobile])

onMounted(() => {
  useEventBus(BusEvents.ConnectMobileModalOpened).on(() => {
    initServerConnection()
  })
})

function closeModal() {
  modalStore.closeModal(Modal.ConnectMobile)
}

function initServerConnection() {
  status.setLoading()

  addDesktopAddress({
    desktopAddress: sharedWalletStore.injectiveAddress
  })
    .then(() => {
      resume()
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

function grantAuthorization() {
  status.setLoading()

  if (!mobileAddress.value) {
    return
  }

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
    .finally(() => status.setIdle())
}

const { pause, resume } = useIntervalFn(
  async () => {
    const result = await getMobileAddress({
      desktopAddress: sharedWalletStore.injectiveAddress
    })

    if (!result?.data?.mobileAddress) {
      return
    }
    mobileAddress.value = result.data.mobileAddress
    pause()
  },
  1000 * 2,
  {
    immediate: false,
    immediateCallback: true
  }
)
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
          {{ $t('portfolio.connectMobile.scanQRCode') }}
        </p>
      </div>
      <AppButton
        v-bind="{ status }"
        :disabled="!mobileAddress"
        class="w-full"
        variant="primary"
        @click="grantAuthorization"
      >
        {{
          mobileAddress
            ? $t('portfolio.connectMobile.grantAccess')
            : $t('portfolio.connectMobile.scanCode')
        }}
      </AppButton>
    </section>
  </AppModal>
</template>
