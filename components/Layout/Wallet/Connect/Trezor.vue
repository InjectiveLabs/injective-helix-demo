<script lang="ts" setup>
import { WalletModalType } from '@/types'

const emit = defineEmits<{
  (e: 'click', type: WalletModalType): void
}>()

function showTrezorModal() {
  emit('click', WalletModalType.Trezor)
}
</script>

<template>
  <LayoutWalletConnectWrapper @click="showTrezorModal">
    <template #logo>
      <BaseIcon name="wallet/trezor" class="w-8 h-8" />
    </template>

    <template #title>
      {{ $t('connect.trezor') }}
    </template>

    <template #description>
      <span data-cy="connect-wallet-popup-trezor-button">
        {{ $t('connect.connectUsingHardware') }}
      </span>
    </template>
  </LayoutWalletConnectWrapper>
</template>
