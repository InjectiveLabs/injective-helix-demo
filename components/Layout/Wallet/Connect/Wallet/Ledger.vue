<script lang="ts" setup>
import { WalletModalType } from '@/types'

const emit = defineEmits<{
  (e: 'click', type: WalletModalType): void
}>()

function showLedgerModal() {
  emit('click', WalletModalType.Ledger)
}
</script>

<template>
  <LayoutWalletConnectWrapper @click="showLedgerModal">
    <template #logo>
      <BaseIcon name="wallet/ledger" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.ledger') }}
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-ledger-button">
        {{ $t('connect.connectUsingHardware') }}
      </span>
    </template>
  </LayoutWalletConnectWrapper>
</template>
