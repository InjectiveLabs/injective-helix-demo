<script lang="ts" setup>
import { WalletConnectStatus } from '@/types'

const walletStore = useWalletStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const downloadOkxWalletLink = ref<any>(null)

function connect() {
  if (walletStore.okxWalletInstalled) {
    walletStore
      .connectOkxWallet()
      .then(() => {
        success({ title: t('connect.successfullyConnected') })
      })
      .catch((e) => {
        walletStore.setWalletConnectStatus(WalletConnectStatus.disconnected)
        $onError(e)
      })
  } else if (downloadOkxWalletLink.value && downloadOkxWalletLink.value.$el) {
    downloadOkxWalletLink.value.$el.click()
  }
}
</script>

<template>
  <LayoutWalletConnectWrapper @click="connect">
    <template #logo>
      <BaseIcon name="wallet/okx-wallet" class="w-8 h-8 bg-white rounded-lg" />
    </template>

    <template #title>
      {{ $t('connect.okxWallet') }}
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-okx-wallet-button">
        {{ $t('connect.connectUsingBrowser') }}
      </span>
    </template>

    <template v-if="!walletStore.okxWalletInstalled" #icon>
      <NuxtLink
        ref="downloadOkxWalletLink"
        to="https://www.okx.com/web3"
        target="_blank"
        rel="noreferrer"
      >
        <BaseIcon name="download" class="h-5 w-5 hover:text-blue-500" />
      </NuxtLink>
    </template>
  </LayoutWalletConnectWrapper>
</template>
