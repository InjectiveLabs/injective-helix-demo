<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  getMobileAddress,
  addDesktopAddress
} from '@/app/services/connectMobile'
import { TRADING_MESSAGES } from '@/app/data/trade'
import { CONNECT_SERVER_URL } from '@/app/utils/constants'
import { BusEvents, Modal } from '@/types'

const authZStore = useAuthZStore()
const modalStore = useSharedModalStore()
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
  MsgType.MsgSend,
  MsgType.MsgExecuteContractCompat
]

const mobileAddress = ref()
const status = reactive(new Status(StatusType.Idle))

onMounted(() => {
  useEventBus(BusEvents.ConnectMobileModalOpened).on(() => {
    initServerConnection()
  })
})

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
      modalStore.closeModal(Modal.ConnectMobile)

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
  <AppModal v-model="modalStore.modals[Modal.ConnectMobile]">
    <section class="text-center max-xs:mt-10">
      <SharedQRCode
        class="max-w-[280px] w-full mx-auto rounded-lg overflow-hidden mt-4"
        :text="qrCodeText"
      />

      <div class="flex justify-center gap-2 mt-6 pb-3">
        <p class="text-ellipsis overflow-hidden max-w-[384px]">
          {{ $t('portfolio.connectMobile.scanQRCode') }}
        </p>
      </div>

      <AppButton
        class="w-full"
        variant="primary"
        v-bind="{ status, disabled: !mobileAddress }"
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
