<script lang="ts" setup>
import { WalletConnectStatus } from '@/types'

const walletStore = useWalletStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

function connect() {
  walletStore
    .connectCosmostation()
    .then(() => {
      success({ title: t('connect.successfullyConnected') })
    })
    .catch((e) => {
      walletStore.setWalletConnectStatus(WalletConnectStatus.disconnected)
      $onError(e)
    })
}
</script>

<template>
  <LayoutWalletConnectWrapper @click="connect">
    <template #logo>
      <BaseIcon name="wallet/cosmostation" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.cosmostation') }}
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-ledger-button">
        {{ $t('connect.connectUsingBrowser') }}
      </span>
    </template>
  </LayoutWalletConnectWrapper>
</template>
