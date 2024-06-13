<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@/app/utils/constants'

import { mixpanelAnalytics } from '@/app/providers/mixpanel'
import { Modal, BusEvents, WalletModalType, WalletConnectStatus } from '@/types'

const modalStore = useModalStore()
const walletStore = useWalletStore()

const status: Status = reactive(new Status(StatusType.Loading))
const walletModalType = ref<WalletModalType>(WalletModalType.All)

const isModalOpen = computed<boolean>(
  () => modalStore.modals[Modal.Connect] && !walletStore.isUserWalletConnected
)

onMounted(() => {
  useEventBus<string>(BusEvents.ShowLedgerConnect).on(connectLedger)

  Promise.all([
    walletStore.isMetamaskInstalled(),
    walletStore.isTrustWalletInstalled(),
    walletStore.isPhantomInstalled(),
    walletStore.isOkxWalletInstalled(),
    walletStore.isBitGetInstalled()
  ]).finally(() => status.setIdle())
})

function connectLedger() {
  walletModalType.value = WalletModalType.Ledger

  modalStore.openModal(Modal.Connect)
}

function onWalletConnect() {
  mixpanelAnalytics.trackConnectClicked()

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

  <AppButton v-else @click="onWalletConnect">
    {{ $t('connect.connectWallet') }}
  </AppButton>

  <AppHocModal :is-open="isModalOpen" @modal:close="onCloseModal">
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

    <div class="p-4">
      <LayoutWalletLedger v-if="walletModalType === WalletModalType.Ledger" />
      <LayoutWalletTrezor
        v-else-if="walletModalType === WalletModalType.Trezor"
      />

      <ul
        v-else
        class="divide-gray-800 border-gray-700 rounded-lg max-h-[65vh]"
      >
        <p class="text-gray-400 font-semibold text-sm mb-2">
          {{ $t('common.popular') }}
        </p>
        <LayoutWalletConnectWalletMetamask />
        <LayoutWalletConnectWalletOkxWallet />
        <LayoutWalletConnectWalletKeplr />
        <p class="text-gray-400 font-semibold text-sm mt-4">
          {{ $t('common.otherWallets') }}
        </p>
        <div class="grid grid-cols-4">
          <LayoutWalletConnectWalletNinji />
          <LayoutWalletConnectWalletLedger @click="onWalletModalTypeChange" />
          <LayoutWalletConnectWalletTrezor @click="onWalletModalTypeChange" />
          <LayoutWalletConnectWalletTrustWallet />
          <LayoutWalletConnectWalletPhantom />
          <LayoutWalletConnectWalletLeap />
          <LayoutWalletConnectWalletCosmostation />
          <LayoutWalletConnectWalletTorus />
        </div>
      </ul>
    </div>
  </AppHocModal>
  <ModalsTerms />
</template>
