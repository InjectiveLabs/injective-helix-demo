<script lang="ts" setup>
import { WalletConnectStatus } from '@/types'

const walletStore = useWalletStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const downloadPhantomLink = ref<any>(null)

function connect() {
  if (walletStore.trustWalletInstalled) {
    walletStore
      .connectPhantom()
      .then(() => {
        success({ title: t('connect.successfullyConnected') })
      })
      .catch((e) => {
        walletStore.setWalletConnectStatus(WalletConnectStatus.disconnected)
        $onError(e)
      })
  } else if (downloadPhantomLink.value && downloadPhantomLink.value.$el) {
    downloadPhantomLink.value.$el.click()
  }
}
</script>

<template>
  <LayoutWalletConnectWrapper @click="connect">
    <template #logo>
      <BaseIcon name="wallet/phantom" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.phantom') }}
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-phantom-wallet-button">
        {{ $t('connect.connectUsingBrowser') }}
      </span>
    </template>

    <template v-if="!walletStore.phantomInstalled" #icon>
      <NuxtLink
        ref="downloadPhantomLink"
        to="https://www.okx.com/web3"
        target="_blank"
        rel="noreferrer"
      >
        <BaseIcon name="download" class="h-5 w-5 hover:text-blue-500" />
      </NuxtLink>
    </template>
  </LayoutWalletConnectWrapper>
</template>
