<script lang="ts" setup>
import { isCosmosWalletInstalled, Wallet } from '@injectivelabs/wallet-ts'
import { WalletConnectStatus } from '@/types'

const walletStore = useWalletStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const isWalletInstalled = isCosmosWalletInstalled(Wallet.Keplr)
const downloadKeplrLink = ref<any>(null)

function connect() {
  if (isWalletInstalled) {
    walletStore
      .connectKeplr()
      .then(() => success({ title: t('connect.successfullyConnected') }))
      .catch((e) => {
        walletStore.setWalletConnectStatus(WalletConnectStatus.disconnected)
        $onError(e)
      })
  } else if (downloadKeplrLink.value && downloadKeplrLink.value.$el) {
    downloadKeplrLink.value.$el.click()
  }
}
</script>

<template>
  <LayoutWalletConnectWrapper @click="connect">
    <template #logo>
      <SharedIcon name="wallet/keplr" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.keplr') }}
    </template>

    <template #description>
      <div>
        <span data-cy="connect-wallet-popup-keplr-button">
          {{ $t('connect.connectUsingKeplr') }}
        </span>
      </div>
    </template>

    <template v-if="!isWalletInstalled" #icon>
      <NuxtLink
        ref="downloadKeplrLink"
        to="https://www.keplr.app/download"
        target="_blank"
        rel="noreferrer"
      >
        <SharedIcon name="download" class="h-5 w-5 hover:text-blue-500" />
      </NuxtLink>
    </template>
  </LayoutWalletConnectWrapper>
</template>
