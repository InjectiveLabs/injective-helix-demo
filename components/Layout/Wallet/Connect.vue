<script lang="ts" setup>
import { WalletConnectStatus } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { Wallet, isCosmosWalletInstalled } from '@injectivelabs/wallet-ts'
import { IS_DEVNET } from '@shared/utils/constant'
import { WalletOption } from '@/types'

const sharedWalletStore = useSharedWalletStore()

withDefaults(
  defineProps<{
    isSignUp?: boolean
  }>(),
  {
    isSignUp: false
  }
)

const emits = defineEmits<{
  'modal:closed': []
}>()

const isShowMoreWallets = ref(false)
const selectedWallet = ref<Wallet | undefined>(undefined)
const status = reactive(new Status(StatusType.Loading))
const magicStatus = reactive(new Status(StatusType.Idle))

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
          },
      {
        wallet: Wallet.OkxWallet,
        downloadLink: !sharedWalletStore.okxWalletInstalled
          ? 'https://www.okx.com/web3'
          : undefined
      }
    ].filter((option) => option) as WalletOption[]
)

const options = computed(
  () =>
    [
      { wallet: Wallet.Ledger },
      {
        beta: true,
        wallet: Wallet.Phantom
      },
      IS_DEVNET
        ? undefined
        : {
            wallet: Wallet.BitGet,
            downloadLink: !sharedWalletStore.bitGetInstalled
              ? 'https://web3.bitget.com/en/wallet-download'
              : undefined
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
        wallet: Wallet.Cosmostation,
        downloadLink: !isCosmosWalletInstalled(Wallet.Cosmostation)
          ? 'https://www.cosmostation.io/wallet'
          : undefined
      },
      { wallet: Wallet.Trezor }

      // Disabled for now
      // {
      //   wallet: Wallet.TrustWallet,
      //   downloadLink: !sharedWalletStore.trustWalletInstalled
      //     ? 'https://trustwallet.com/browser-extension/'
      //     : undefined
      // },

      // Disabled for now
      // {
      //   wallet: Wallet.Torus
      // },

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

watch(
  () => sharedWalletStore.walletConnectStatus,
  (status: WalletConnectStatus) => {
    if (status === WalletConnectStatus.idle) {
      magicStatus.setIdle()
    }

    if (status === WalletConnectStatus.connected) {
      magicStatus.setIdle()
      emits('modal:closed')
    }
  }
)

function onSetMagicStatusLoading() {
  magicStatus.setLoading()
}

function onWalletModalTypeChange(wallet?: Wallet) {
  selectedWallet.value = wallet
}

function toggleShowMoreWallets() {
  isShowMoreWallets.value = !isShowMoreWallets.value
}
</script>

<template>
  <AppHocLoading wrapper-class="p-32" v-bind="{ status: magicStatus }">
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
        <h1 class="text-xl text-center font-semibold">
          {{ isSignUp ? $t('connect.signUp') : $t('connect.logIn') }}
        </h1>

        <LayoutWalletSso
          class="my-6"
          @set:magicStatusLoading="onSetMagicStatusLoading"
        />

        <div class="flex items-center justify-center">
          <div class="border-t flex-1" />
          <p class="px-4 text-gray-400">{{ $t('common.or') }}</p>
          <div class="border-t flex-1" />
        </div>

        <div class="space-y-2">
          <LayoutWalletConnectItem
            v-for="walletOption in isShowMoreWallets ? options : popularOptions"
            :key="walletOption.wallet"
            v-bind="{ walletOption }"
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
          isShowMoreWallets
            ? $t('connect.showLessWallets')
            : $t('connect.showMoreWallets')
        }}
      </AppButton>
    </div>
  </AppHocLoading>
</template>
