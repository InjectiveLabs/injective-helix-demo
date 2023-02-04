<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { BusEvents, Modal, WalletConnectStatus, WalletModalType } from '@/types'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@/app/utils/constants'
import { amplitudeTracker } from '@/app/providers/AmplitudeTracker'

const modalStore = useModalStore()
const walletStore = useWalletStore()

const status: Status = reactive(new Status(StatusType.Loading))
const walletModalType = ref<WalletModalType>(WalletModalType.All)

const showLoading = computed<boolean>(
  () => walletStore.walletConnectStatus === WalletConnectStatus.connecting
)
const showModal = computed<boolean>(
  () => modalStore.modals[Modal.Connect] && !walletStore.isUserWalletConnected
)

onMounted(() => {
  useEventBus<string>(BusEvents.ShowLedgerConnect).on(showLedgerConnect)

  Promise.all([walletStore.isMetamaskInstalled()]).finally(() =>
    status.setIdle()
  )
})

function showLedgerConnect() {
  walletModalType.value = WalletModalType.Ledger
  modalStore.openModal({ type: Modal.Connect })
}

function close() {
  modalStore.closeModal(Modal.Connect)
}

function updateWalletModalType(type: WalletModalType) {
  walletModalType.value = type
}

function handleWalletConnectClicked() {
  amplitudeTracker.submitWalletConnectClickedTrackEvent()

  if (GEO_IP_RESTRICTIONS_ENABLED) {
    modalStore.openModal({ type: Modal.Terms })
  } else {
    modalStore.openModal({ type: Modal.Connect })
  }
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

watch(showModal, (newShowModalState) => {
  if (!newShowModalState) {
    close()
    walletModalType.value = WalletModalType.All
  }
})
</script>

<template>
  <div v-if="walletStore.isUserWalletConnected">
    <LayoutWalletDetails />
  </div>

  <AppButton
    v-else
    class="bg-blue-500 text-blue-900 font-semibold whitespace-nowrap"
    @click="handleWalletConnectClicked"
  >
    {{ $t('connect.connectWallet') }}
  </AppButton>

  <AppModalWrapper
    :show="showModal"
    :show-loading="showLoading"
    :ignore="['.v-popper__popper']"
    md
    @modal:closed="close"
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
      class="divide-y divide-gray-800 border-gray-700 rounded-lg overflow-hidden"
    >
      <LayoutWalletConnectWalletMetamask />
      <LayoutWalletConnectWalletKeplr />
      <LayoutWalletConnectWalletCosmostation />
      <LayoutWalletConnectWalletLeap />
      <LayoutWalletConnectWalletTorus />
      <LayoutWalletConnectWalletLedger @click="updateWalletModalType" />
      <LayoutWalletConnectWalletTrezor @click="updateWalletModalType" />
    </ul>
  </AppModalWrapper>
  <ModalsTerms />
</template>
