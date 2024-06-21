<script lang="ts" setup>
const walletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

const downloadTrustWalletLink = ref<any>(null)

function connect() {
  if (walletStore.trustWalletInstalled) {
    walletStore
      .connectTrustWallet()
      .then(() =>
        notificationStore.success({ title: t('connect.successfullyConnected') })
      )
      .catch((e) => {
        $onError(e)
      })
  } else if (
    downloadTrustWalletLink.value &&
    downloadTrustWalletLink.value.$el
  ) {
    downloadTrustWalletLink.value.$el.click()
  }
}
</script>

<template>
  <LayoutWalletConnectWrapperMini @click="connect">
    <template #logo>
      <SharedIcon name="wallet/trust-wallet" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.trustWallet') }}
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-trust-wallet-button">
        {{ $t('connect.connectUsingBrowser') }}
      </span>
    </template>

    <template v-if="!walletStore.trustWalletInstalled" #icon>
      <NuxtLink
        ref="downloadTrustWalletLink"
        to="https://trustwallet.com/browser-extension/"
        target="_blank"
        rel="noreferrer"
      >
        <SharedIcon name="download" class="h-5 w-5 hover:text-blue-500" />
      </NuxtLink>
    </template>
  </LayoutWalletConnectWrapperMini>
</template>
