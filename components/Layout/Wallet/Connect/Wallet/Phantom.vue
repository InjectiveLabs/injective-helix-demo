<script lang="ts" setup>
const walletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

const downloadPhantomLink = ref<any>(null)

function connect() {
  if (walletStore.phantomInstalled) {
    walletStore
      .connectPhantomWallet()
      .then(() =>
        notificationStore.success({ title: t('connect.successfullyConnected') })
      )
      .catch((e) => {
        $onError(e)
      })
  } else if (downloadPhantomLink.value && downloadPhantomLink.value.$el) {
    downloadPhantomLink.value.$el.click()
  }
}
</script>

<template>
  <LayoutWalletConnectWrapperMini @click="connect">
    <template #logo>
      <SharedIcon name="wallet/phantom" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.phantom') }}
      <span class="text-2xs ml-2 text-primary-500">Beta</span>
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-phantom-wallet-button">
        {{ $t('connect.connectUsingBrowser') }}
      </span>
    </template>

    <template v-if="!walletStore.phantomInstalled" #icon>
      <NuxtLink
        ref="downloadPhantomLink"
        to="https://phantom.app/download"
        target="_blank"
        rel="noreferrer"
      >
        <SharedIcon name="download" class="h-5 w-5 hover:text-blue-500" />
      </NuxtLink>
    </template>
  </LayoutWalletConnectWrapperMini>
</template>
