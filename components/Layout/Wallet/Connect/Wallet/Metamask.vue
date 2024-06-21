<script lang="ts" setup>
const walletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

const downloadMetamaskLink = ref<any>(null)

function connect() {
  if (walletStore.metamaskInstalled) {
    walletStore
      .connectMetamask()
      .then(() =>
        notificationStore.success({ title: t('connect.successfullyConnected') })
      )
      .catch((e) => {
        $onError(e)
      })
  } else if (downloadMetamaskLink.value && downloadMetamaskLink.value.$el) {
    downloadMetamaskLink.value.$el.click()
  }
}
</script>

<template>
  <LayoutWalletConnectWrapper @click="connect">
    <template #logo>
      <SharedIcon name="wallet/metamask" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.metamask') }}
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-metamask-button">
        {{ $t('connect.connectUsingBrowser') }}
      </span>
    </template>

    <template v-if="!walletStore.metamaskInstalled" #icon>
      <NuxtLink
        ref="downloadMetamaskLink"
        to="https://metamask.io/download"
        target="_blank"
        rel="noreferrer"
      >
        <SharedIcon name="download" class="h-5 w-5 hover:text-blue-500" />
      </NuxtLink>
    </template>
  </LayoutWalletConnectWrapper>
</template>
