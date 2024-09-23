<script setup lang="ts">
import { Wallet } from '@injectivelabs/wallet-ts'
import { WalletOption } from '@/types'

const walletStore = useWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    isCompact?: boolean
    isBackButton?: boolean
    walletOption: WalletOption
  }>(),
  {
    isCompact: false,
    isBackButton: false
  }
)

const emit = defineEmits<{
  'selectedHardwareWallet:toggle': [wallet: Wallet | undefined]
}>()

const hardwareWallets = [Wallet.Ledger, Wallet.Trezor]

function handleConnect() {
  if (props.isBackButton) {
    emit('selectedHardwareWallet:toggle', undefined)
    return
  }

  if (props.walletOption.downloadLink) {
    return navigateTo(props.walletOption.downloadLink, {
      open: {
        target: '_blank'
      }
    })
  }

  if (hardwareWallets.includes(props.walletOption.wallet)) {
    emit('selectedHardwareWallet:toggle', props.walletOption.wallet)
    return
  }

  walletStore
    .connect({ wallet: props.walletOption.wallet })
    .then(() =>
      notificationStore.success({ title: t('connect.successfullyConnected') })
    )
    .catch((e) => {
      walletStore.disconnect()
      WalletTracker.trackLogout()

      $onError(e)
    })
}
</script>

<template>
  <button
    v-if="isCompact"
    class="rounded-lg hover:bg-brand-800 flex flex-col items-center py-4"
    @click="handleConnect"
  >
    <SharedIcon class="w-6 h-6" :name="`wallet/${walletOption.wallet}`" />
    <p class="text-xs mt-2">{{ $t(`connect.${walletOption.wallet}`) }}</p>
  </button>

  <button
    v-else
    class="flex w-full p-2 px-4 rounded-lg hover:bg-brand-800 items-stretch"
    @click="handleConnect"
  >
    <div
      class="py-2 flex items-center"
      :class="{
        invert: walletOption.wallet === Wallet.OkxWallet
      }"
    >
      <SharedIcon class="w-8 h-8" :name="`wallet/${walletOption.wallet}`" />
    </div>

    <div class="mx-4 text-left flex-1 pt-1">
      <p class="flex items-start">
        <span>{{ $t(`connect.${walletOption.wallet}`) }}</span>
        <span
          v-if="walletOption.beta"
          class="text-xs text-red-500 leading-6 ml-2"
        >
          {{ $t('connect.beta') }}
        </span>
      </p>

      <p class="text-xs text-gray-500">
        <span v-if="hardwareWallets.includes(walletOption.wallet)">
          {{ $t(`connect.${'connectUsingHardware'}`) }}
        </span>
        <span v-else>{{ $t(`connect.${'connectUsingBrowser'}`) }}</span>
      </p>
    </div>

    <NuxtLink
      v-if="walletOption.downloadLink"
      target="_blank"
      :to="walletOption.downloadLink"
      class="flex items-center hover:text-blue-500"
      @click.stop
    >
      <SharedIcon class="h-6 w-6" name="download" />
    </NuxtLink>
  </button>
</template>
