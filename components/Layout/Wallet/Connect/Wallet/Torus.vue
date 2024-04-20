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
  <LayoutWalletConnectWrapperMini @click="connect">
    <template #logo>
      <BaseIcon name="wallet/torus" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.torus') }}
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-torus-button">
        {{ $t('connect.connectUsingTorus') }}
      </span>
    </template>

    <template #addon>
      <div class="grid grid-cols-4 gap-4 text-white">
        <BaseIcon name="social/google" is-md />
        <BaseIcon name="social/facebook" is-md />
        <BaseIcon name="social/twitter" is-md />
        <BaseIcon name="social/discord" is-md />
      </div>
    </template>
  </LayoutWalletConnectWrapperMini>
</template>
