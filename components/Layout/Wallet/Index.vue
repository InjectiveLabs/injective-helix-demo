<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@/app/utils/constants'
import { amplitudeGenericTracker } from '@/app/providers/amplitude'
import {
  Modal,
  BusEvents,
  AmplitudeEvent,
  WalletModalType,
  WalletConnectStatus
} from '@/types'

const modalStore = useModalStore()
const walletStore = useWalletStore()

const status: Status = reactive(new Status(StatusType.Loading))
const walletModalType = ref<WalletModalType>(WalletModalType.All)

const isModalOpen = computed<boolean>(
  () => modalStore.modals[Modal.Connect] && !walletStore.isUserWalletConnected
)

const isLoading = computed<boolean>(
  () => walletStore.walletConnectStatus === WalletConnectStatus.connecting
)

onMounted(() => {
  useEventBus<string>(BusEvents.ShowLedgerConnect).on(connectLedger)

  Promise.all([
    walletStore.isMetamaskInstalled(),
    walletStore.isTrustWalletInstalled()
  ]).finally(() => status.setIdle())
})

function connectLedger() {
  walletModalType.value = WalletModalType.Ledger

  modalStore.openModal(Modal.Connect)
}

function onWalletConnect() {
  amplitudeGenericTracker.trackEvent(AmplitudeEvent.ConnectClicked)

  if (GEO_IP_RESTRICTIONS_ENABLED) {
    modalStore.openModal(Modal.Terms)
  } else {
    modalStore.openModal(Modal.Connect)
  }
}

function onCloseModal() {
  modalStore.closeModal(Modal.Connect)
}

function onWalletModalTypeChange(type: WalletModalType) {
  walletModalType.value = type
}

watch(
  () => walletStore.walletConnectStatus,
  (newWalletConnectStatus) => {
    if (newWalletConnectStatus === WalletConnectStatus.connected) {
      modalStore.closeModal(Modal.Connect)
      modalStore.openPersistedModalIfExist()
    }
  }
)

watch(isModalOpen, (newShowModalState) => {
  if (!newShowModalState) {
    onCloseModal()
    walletModalType.value = WalletModalType.All
  }
})
</script>

<template>
  <LayoutWalletDetails v-if="walletStore.isUserWalletConnected" />

  <AppButton
    v-else
    class="bg-blue-500 text-blue-900 font-semibold whitespace-nowrap"
    @click="onWalletConnect"
  >
    {{ $t('connect.connectWallet') }}
  </AppButton>

  <AppModal
    :is-open="isModalOpen"
    :is-loading="isLoading"
    :ignore="['.v-popper__popper']"
    is-md
    @modal:closed="onCloseModal"
  >
    <template #title>
      <h3 v-if="walletModalType === WalletModalType.Trezor">
        {{ $t('connect.connectUsingTrezor') }}
      </h3>
      <h3 v-else-if="walletModalType === WalletModalType.Ledger">
        {{ $t('connect.connectUsingLedger') }}
      </h3>
      <h3 v-else>
        {{ $t('connect.connectToWallet') }}
      </h3>
    </template>

    <LayoutWalletLedger v-if="walletModalType === WalletModalType.Ledger" />
    <LayoutWalletTrezor
      v-else-if="walletModalType === WalletModalType.Trezor"
    />
    <ul
      v-else
      class="divide-y divide-gray-800 border-gray-700 rounded-lg max-h-[65vh]"
    >
      <LayoutWalletConnectWalletMetamask />
      <LayoutWalletConnectWalletKeplr />
      <LayoutWalletConnectWalletNinji />
      <LayoutWalletConnectWalletLedger @click="onWalletModalTypeChange" />
      <LayoutWalletConnectWalletTrezor @click="onWalletModalTypeChange" />
      <LayoutWalletConnectWalletTrustWallet />
      <LayoutWalletConnectWalletLeap />
      <LayoutWalletConnectWalletCosmostation />
      <LayoutWalletConnectWalletTorus />
    </ul>
  </AppModal>
  <ModalsTerms />
</template>
