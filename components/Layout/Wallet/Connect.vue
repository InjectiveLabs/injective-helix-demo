<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { Wallet, isCosmosWalletInstalled } from '@injectivelabs/wallet-ts'
import { IS_DEVNET } from '@shared/utils/constant'
import { WalletOption } from '@/types'

const sharedWalletStore = useSharedWalletStore()

const status: Status = reactive(new Status(StatusType.Loading))
const selectedWallet = ref<Wallet | undefined>(undefined)
const isShowMoreWallets = ref(false)

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
    sharedWalletStore.checkIsBitGetInstalled(),
    sharedWalletStore.checkIsMetamaskInstalled(),
    sharedWalletStore.checkIsOkxWalletInstalled(),
    sharedWalletStore.checkIsTrustWalletInstalled(),
    sharedWalletStore.checkIsPhantomWalletInstalled()
  ]).finally(() => status.setIdle())
})

function onWalletModalTypeChange(wallet: Wallet | undefined) {
  selectedWallet.value = wallet
}

function toggleShowMoreWallets() {
  isShowMoreWallets.value = !isShowMoreWallets.value
}
</script>

<template>
  <div class="py-4 -mt-6 -mb-4">
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

    <ul v-else class="divide-gray-800 border-gray-700 rounded-lg -mt-6">
      <div class="flex items-center max-w-md">
        <img src="/svg/avatar-onboarding.svg" alt="" />

        <div>
          <p class="text-xl font-semibold">
            {{ $t('connect.getStarted') }}
          </p>
          <p class="text-sm">
            {{ $t('connect.getStartedDescription') }}
          </p>
        </div>
      </div>

      <div class="border border-dashed rounded-md p-4 my-4 text-center">
        SSO
      </div>

      <div class="flex items-center justify-center">
        <div class="border-t flex-1" />
        <p class="px-4 text-gray-400">or</p>
        <div class="border-t flex-1" />
      </div>

      <div
        class="space-y-2"
        :class="{
          'grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))]':
            isShowMoreWallets
        }"
      >
        <LayoutWalletConnectItem
          v-for="walletOption in isShowMoreWallets ? options : popularOptions"
          :key="walletOption.wallet"
          v-bind="{ walletOption, isCompact: isShowMoreWallets }"
          @selected-hardware-wallet:toggle="onWalletModalTypeChange"
        />
      </div>
    </ul>

    <AppButton
      class="w-full text-gray-400 hover:text-white mt-4"
      variant="primary-ghost"
      @click="toggleShowMoreWallets"
    >
      {{
        isShowMoreWallets ? $t('common.back') : $t('connect.showMoreWallets')
      }}
    </AppButton>
  </div>
</template>
