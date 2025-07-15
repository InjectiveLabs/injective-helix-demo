<script lang="ts" setup>
import { IS_DEVNET } from '@shared/utils/constant'
import { WalletConnectStatus } from '@shared/types'
import { Wallet } from '@injectivelabs/wallet-base'
import { Status, StatusType } from '@injectivelabs/utils'
import { isCosmosWalletInstalled } from '@injectivelabs/wallet-cosmos'
import { isCosmosStationWalletInstalled } from '@injectivelabs/wallet-cosmostation'
import type { WalletOption } from '@/types'

const sharedWalletStore = useSharedWalletStore()

const emits = defineEmits<{
  'modal:closed': []
}>()

const showOtp = ref(false)
const isShowMoreWallets = ref(false)
const showDeprecatedSso = ref(false)
const selectedWallet = ref<Wallet | undefined>(undefined)
const status = reactive(new Status(StatusType.Loading))
const ssoStatus = reactive(new Status(StatusType.Idle))

const popularOptions = computed(
  () =>
    [
      {
        wallet: Wallet.Keplr,
        downloadLink: !isCosmosWalletInstalled(Wallet.Keplr)
          ? 'https://www.keplr.app/download'
          : undefined
      },
      {
        wallet: Wallet.Metamask,
        downloadLink: !sharedWalletStore.metamaskInstalled
          ? 'https://metamask.io/download'
          : undefined
      },
      IS_DEVNET
        ? undefined
        : {
            wallet: Wallet.Leap,
            downloadLink: !isCosmosWalletInstalled(Wallet.Leap)
              ? 'https://www.leapwallet.io/downloads'
              : undefined
          }
    ].filter((option) => option) as WalletOption[]
)

const options = computed(
  () =>
    [
      {
        wallet: Wallet.Rainbow,
        downloadLink: !sharedWalletStore.rainbowInstalled
          ? 'https://rainbow.me/download'
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
      {
        wallet: Wallet.OkxWallet,
        downloadLink: !sharedWalletStore.okxWalletInstalled
          ? 'https://www.okx.com/web3'
          : undefined
      },
      { wallet: Wallet.Ledger },
      { wallet: Wallet.TrezorBip32 },
      {
        wallet: Wallet.Cosmostation,
        downloadLink: !isCosmosWalletInstalled(Wallet.Cosmostation)
          ? 'https://www.cosmostation.io/wallet'
          : undefined
      },
      { wallet: Wallet.Phantom },
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
        wallet: Wallet.Cosmostation,
        downloadLink: !isCosmosStationWalletInstalled()
          ? 'https://www.cosmostation.io/wallet'
          : undefined
      },
      { wallet: Wallet.WalletConnect },
      { wallet: Wallet.Magic }
      // Disabled for now
      // {
      //   wallet: Wallet.TrustWallet,
      //   downloadLink: !sharedWalletStore.trustWalletInstalled
      //     ? 'https://trustwallet.com/browser-extension/'
      //     : undefined
      // },
    ].filter((option) => option) as WalletOption[]
)

onMounted(() => {
  showOtp.value = false
  showDeprecatedSso.value = false

  Promise.all([
    sharedWalletStore.checkIsBitGetInstalled(),
    sharedWalletStore.checkIsRainbowInstalled(),
    sharedWalletStore.checkIsMetamaskInstalled(),
    sharedWalletStore.checkIsOkxWalletInstalled(),
    sharedWalletStore.checkIsTrustWalletInstalled(),
    sharedWalletStore.checkIsPhantomWalletInstalled()
  ]).finally(() => status.setIdle())
})

watch(
  () => sharedWalletStore.walletConnectStatus,
  (status: WalletConnectStatus) => {
    if (status === WalletConnectStatus.connected) {
      onCloseModal()
    }
  }
)

function onCloseModal() {
  emits('modal:closed')
}

function onShowOtp() {
  showOtp.value = true
}

function setSsoStatusLoading() {
  ssoStatus.setLoading()
}

function onShowDeprecatedSso() {
  showDeprecatedSso.value = true
}

function onWalletModalTypeChange(wallet?: Wallet) {
  selectedWallet.value = wallet
}

function toggleShowMoreWallets() {
  isShowMoreWallets.value = !isShowMoreWallets.value
}
</script>

<template>
  <AppHocLoading wrapper-class="p-32" v-bind="{ status: ssoStatus }">
    <LayoutWalletOTP v-if="showOtp" @sso:set-loading="setSsoStatusLoading" />
    <LayoutWalletDeprecatedSSO v-else-if="showDeprecatedSso" />

    <div v-else class="py-4 -mt-6 -mb-4">
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

      <div v-else-if="selectedWallet === Wallet.TrezorBip32" class="space-y-4">
        <LayoutWalletConnectItem
          is-back-button
          v-bind="{
            walletOption: {
              wallet: Wallet.TrezorBip32
            }
          }"
          @selected-hardware-wallet:toggle="onWalletModalTypeChange"
        />
        <LayoutWalletTrezor />
      </div>

      <ul v-else class="divide-coolGray-800 border-coolGray-700 rounded-lg">
        <h1 class="text-xl text-center font-semibold">
          {{ $t('common.connect') }}
        </h1>

        <LayoutWalletSso
          class="my-6"
          @opt:show="onShowOtp"
          @sso:set-loading="onCloseModal"
        />

        <div class="flex items-center justify-center">
          <div class="border-t flex-1" />
          <p class="px-4 text-coolGray-400">{{ $t('common.or') }}</p>
          <div class="border-t flex-1" />
        </div>

        <div class="space-y-2">
          <LayoutWalletConnectItem
            v-for="walletOption in isShowMoreWallets
              ? [...popularOptions, ...options]
              : popularOptions"
            :key="walletOption.wallet"
            v-bind="{ walletOption }"
            @deprecated-sso:show="onShowDeprecatedSso"
            @selected-hardware-wallet:toggle="onWalletModalTypeChange"
          />
        </div>
      </ul>

      <AppButton
        v-if="!selectedWallet"
        class="w-full text-coolGray-400 hover:text-white mt-4"
        variant="primary-ghost"
        @click="toggleShowMoreWallets"
      >
        {{
          isShowMoreWallets
            ? $t('connect.showLessWallets')
            : $t('connect.showMoreWallets')
        }}
      </AppButton>
    </div>
  </AppHocLoading>
</template>
