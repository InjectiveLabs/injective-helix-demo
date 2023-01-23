<script lang="ts" setup>
import { WalletConnectStatus } from '@/types'

const walletStore = useWalletStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

function connect() {
  walletStore
    .connectKeplr()
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
      <BaseIcon name="wallet/keplr" class="w-8 h-8" />
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
  </LayoutWalletConnectWrapper>
</template>
