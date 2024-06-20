<script lang="ts" setup>
import { WalletConnectStatus } from '@/types'

const walletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()

const { $onError } = useNuxtApp()
const { t } = useLang()

const downloadBitGetLink = ref<any>(null)

function connect() {
  if (walletStore.bitGetInstalled) {
    walletStore
      .connectBitGet()
      .then(() =>
        notificationStore.success({ title: t('connect.successfullyConnected') })
      )
      .catch((e) => {
        walletStore.setWalletConnectStatus(WalletConnectStatus.disconnected)
        $onError(e)
      })
  } else if (downloadBitGetLink.value && downloadBitGetLink.value.$el) {
    downloadBitGetLink.value.$el.click()
  }
}
</script>

<template>
  <LayoutWalletConnectWrapper @click="connect">
    <template #logo>
      <SharedIcon name="wallet/BitGet" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.bitGet') }}
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-bitget-button">
        {{ $t('connect.connectUsingBrowser') }}
      </span>
    </template>

    <template v-if="!walletStore.bitGetInstalled" #icon>
      <NuxtLink
        ref="downloadBitGetLink"
        to="https://web3.bitget.com/en/wallet-download"
        target="_blank"
        rel="noreferrer"
      >
        <SharedIcon name="download" class="h-5 w-5 hover:text-blue-500" />
      </NuxtLink>
    </template>
  </LayoutWalletConnectWrapper>
</template>
