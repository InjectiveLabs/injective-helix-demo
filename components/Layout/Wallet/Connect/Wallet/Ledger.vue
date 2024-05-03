<script lang="ts" setup>
import { WalletModalType } from '@/types'

const emit = defineEmits<{
  click: [type: WalletModalType]
}>()

function showLedgerModal() {
  emit('click', WalletModalType.Ledger)
}
</script>

<template>
  <LayoutWalletConnectWrapperMini @click="showLedgerModal">
    <template #logo>
      <SharedIcon name="wallet/ledger" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.ledger') }}
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-ledger-button">
        {{ $t('connect.connectUsingHardware') }}
      </span>
    </template>
  </LayoutWalletConnectWrapperMini>
</template>
