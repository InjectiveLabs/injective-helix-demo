<script lang="ts" setup>
import { isCosmosWalletInstalled, Wallet } from '@injectivelabs/wallet-ts'
import { WalletConnectStatus } from '@/types'

const walletStore = useWalletStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const isWalletInstalled = isCosmosWalletInstalled(Wallet.Leap)
const downloadCosmostationLink = ref<any>(null)

function connect() {
  if (isWalletInstalled) {
    walletStore
      .connectCosmostation()
      .then(() => success({ title: t('connect.successfullyConnected') }))
      .catch((e) => {
        walletStore.setWalletConnectStatus(WalletConnectStatus.disconnected)
        $onError(e)
      })
  } else if (
    downloadCosmostationLink.value &&
    downloadCosmostationLink.value.$el
  ) {
    downloadCosmostationLink.value.$el.click()
  }
}
</script>

<template>
  <LayoutWalletConnectWrapperMini @click="connect">
    <template #logo>
      <SharedIcon name="wallet/cosmostation" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.cosmostation') }}
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-ledger-button">
        {{ $t('connect.connectUsingBrowser') }}
      </span>
    </template>

    <template v-if="!isWalletInstalled" #icon>
      <NuxtLink
        ref="downloadCosmostationLink"
        to="https://www.cosmostation.io/wallet"
        target="_blank"
        rel="noreferrer"
      >
        <SharedIcon name="download" class="h-5 w-5 hover:text-blue-500" />
      </NuxtLink>
    </template>
  </LayoutWalletConnectWrapperMini>
</template>
