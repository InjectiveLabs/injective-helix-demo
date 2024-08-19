<script lang="ts" setup>
import { IS_DEVNET } from '@shared/utils/constant'
import { WalletConnectStatus } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { Wallet, isCosmosWalletInstalled } from '@injectivelabs/wallet-ts'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@/app/utils/constants'
import { Modal, WalletOption } from '@/types'

const modalStore = useModalStore()
const sharedWalletStore = useSharedWalletStore()

const status: Status = reactive(new Status(StatusType.Loading))
const selectedWallet = ref<Wallet | undefined>(undefined)

const isModalOpen = computed<boolean>(
  () => modalStore.modals[Modal.Connect] && !sharedWalletStore.isUserConnected
)

const popularOptions = computed(() => [
  {
    wallet: Wallet.Metamask,
    downloadLink: !sharedWalletStore.metamaskInstalled
      ? 'https://metamask.io/download'
      : undefined
  },
  {
    wallet: Wallet.OkxWallet,
    downloadLink: !sharedWalletStore.okxWalletInstalled
      ? 'https://www.okx.com/web3'
      : undefined
  },
  {
    wallet: Wallet.Keplr,
    downloadLink: !isCosmosWalletInstalled(Wallet.Keplr)
      ? 'https://www.keplr.app/download'
      : undefined
  }
])

const options = computed(
  () =>
    [
      IS_DEVNET
        ? undefined
        : {
            wallet: Wallet.Leap,
            downloadLink: !isCosmosWalletInstalled(Wallet.Leap)
              ? 'https://www.leapwallet.io/downloads'
              : undefined
          },
      IS_DEVNET
        ? undefined
        : {
            wallet: Wallet.BitGet,
            downloadLink: !sharedWalletStore.bitGetInstalled
              ? 'https://web3.bitget.com/en/wallet-download'
              : undefined
          },
      { wallet: Wallet.Ledger },
      { wallet: Wallet.Trezor },
      {
        wallet: Wallet.TrustWallet,
        downloadLink: !sharedWalletStore.trustWalletInstalled
          ? 'https://trustwallet.com/browser-extension/'
          : undefined
      },
      {
        wallet: Wallet.Cosmostation,
        downloadLink: !isCosmosWalletInstalled(Wallet.Cosmostation)
          ? 'https://www.cosmostation.io/wallet'
          : undefined
      },
      {
        wallet: Wallet.Torus
      },
      IS_DEVNET
        ? undefined
        : {
            beta: true,
            wallet: Wallet.Ninji,
            downloadLink: !isCosmosWalletInstalled(Wallet.Ninji)
              ? 'https://ninji.xyz/#download'
              : undefined
          },
      {
        beta: true,
        wallet: Wallet.Phantom
      }
      // { wallet: Wallet.WalletConnect }
    ].filter((option) => option) as WalletOption[]
)

onMounted(() => {
  Promise.all([
    sharedWalletStore.checkIsMetamaskInstalled(),
    sharedWalletStore.checkIsTrustWalletInstalled(),
    sharedWalletStore.checkIsPhantomWalletInstalled(),
    sharedWalletStore.checkIsOkxWalletInstalled(),
    sharedWalletStore.checkIsBitGetInstalled()
  ]).finally(() => status.setIdle())
})

function onWalletConnect() {
  if (GEO_IP_RESTRICTIONS_ENABLED) {
    modalStore.openModal(Modal.Terms)
  } else {
    modalStore.openModal(Modal.Connect)
  }
}

function onCloseModal() {
  modalStore.closeModal(Modal.Connect)
}

function onWalletModalTypeChange(wallet: Wallet | undefined) {
  selectedWallet.value = wallet
}

watch(
  () => sharedWalletStore.walletConnectStatus,
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
    selectedWallet.value = undefined
  }
})
</script>

<template>
  <LayoutWalletDetails v-if="sharedWalletStore.isUserConnected" />

  <AppButton
    v-else
    :data-cy="dataCyTag('button-connect-wallet')"
    @click="onWalletConnect"
  >
    {{ $t('connect.connectWallet') }}
  </AppButton>

  <AppModal
    is-md
    is-transparent
    :is-open="isModalOpen"
    @modal:closed="onCloseModal"
  >
    <div class="py-4">
      <div v-if="selectedWallet === Wallet.Ledger" class="space-y-4">
        <LayoutWalletConnectItem
          is-back-button
          v-bind="{
            walletOption: {
              wallet: Wallet.Ledger
            }
          }"
          @selected-hardware-wallet:toggle="onWalletModalTypeChange"
        />
        <LayoutWalletLedger />
      </div>

      <div v-else-if="selectedWallet === Wallet.Trezor" class="space-y-4">
        <LayoutWalletConnectItem
          is-back-button
          v-bind="{
            walletOption: {
              wallet: Wallet.Trezor
            }
          }"
          @selected-hardware-wallet:toggle="onWalletModalTypeChange"
        />
        <LayoutWalletTrezor />
      </div>

      <ul v-else class="divide-gray-800 border-gray-700 rounded-lg">
        <p class="text-gray-400 font-semibold text-xs mb-2">
          {{ $t('common.popular') }}
        </p>

        <LayoutWalletConnectItem
          v-for="walletOption in popularOptions"
          :key="walletOption.wallet"
          v-bind="{ walletOption }"
          @selected-hardware-wallet:toggle="onWalletModalTypeChange"
        />

        <div class="border-t pt-4 mt-4"></div>

        <p class="text-gray-400 font-semibold text-xs mb-2">
          {{ $t('common.otherWallets') }}
        </p>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))]">
          <LayoutWalletConnectItem
            v-for="walletOption in options"
            :key="walletOption.wallet"
            v-bind="{ walletOption }"
            is-compact
            @selected-hardware-wallet:toggle="onWalletModalTypeChange"
          />
        </div>
      </ul>
    </div>
  </AppModal>

  <ModalsTerms />
</template>
