<script lang="ts" setup>
const walletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

function connect() {
  walletStore
    .connectCosmosStation()
    .then(() =>
      notificationStore.success({ title: t('connect.successfullyConnected') })
    )
    .catch((e) => {
      $onError(e)
    })
}
</script>

<template>
  <LayoutWalletConnectWrapperMini @click="connect">
    <template #logo>
      <SharedIcon name="wallet/torus" class="w-8 h-8" />
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
        <SharedIcon name="social/google" is-md />
        <SharedIcon name="social/facebook" is-md />
        <SharedIcon name="social/twitter" is-md />
        <SharedIcon name="social/discord" is-md />
      </div>
    </template>
  </LayoutWalletConnectWrapperMini>
</template>
