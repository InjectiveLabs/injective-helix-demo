<script lang="ts" setup>
import { isCosmosWalletInstalled, Wallet } from '@injectivelabs/wallet-ts'
import { WalletConnectStatus } from '@/types'

const walletStore = useWalletStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const isWalletInstalled = isCosmosWalletInstalled(Wallet.Ninji)
const downloadNinjiLink = ref<any>(null)

function connect() {
  if (isWalletInstalled) {
    walletStore
      .connectNinji()
      .then(() => success({ title: t('connect.successfullyConnected') }))
      .catch((e) => {
        walletStore.setWalletConnectStatus(WalletConnectStatus.disconnected)
        $onError(e)
      })
  } else if (downloadNinjiLink.value && downloadNinjiLink.value.$el) {
    downloadNinjiLink.value.$el.click()
  }
}
</script>

<template>
  <LayoutWalletConnectWrapperMini @click="connect">
    <template #logo>
      <SharedIcon name="wallet/ninji" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.ninji') }}
      <span class="text-2xs ml-2 text-primary-500">Beta</span>
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-ledger-button">
        {{ $t('connect.connectUsingBrowser') }}
      </span>
    </template>

    <template v-if="!isWalletInstalled" #icon>
      <NuxtLink
        ref="downloadNinjiLink"
        to="https://ninji.xyz/#download"
        target="_blank"
        rel="noreferrer"
      >
        <SharedIcon name="download" class="h-5 w-5 hover:text-blue-500" />
      </NuxtLink>
    </template>
  </LayoutWalletConnectWrapperMini>
</template>
