<script setup lang="ts">
import { WalletConnectStatus } from '@shared/types'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

function onWalletConnect() {
  if (GEO_IP_RESTRICTIONS_ENABLED && !appStore.userState.hasAcceptedTerms) {
    modalStore.openModal(Modal.Terms)
  } else {
    modalStore.openModal(Modal.Connect)
  }
}

const sharedWalletStore = useSharedWalletStore()
</script>

<template>
  <SharedButton
    :loading="
      sharedWalletStore.walletConnectStatus === WalletConnectStatus.connecting
    "
    @click="onWalletConnect"
  >
    <span>{{ $t('connect.connectWallet') }}</span>
  </SharedButton>
</template>
