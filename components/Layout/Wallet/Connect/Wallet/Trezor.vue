<script lang="ts" setup>
import { WalletModalType } from '@/types'

const emit = defineEmits<{
  click: [type: WalletModalType]
}>()

function showTrezorModal() {
  emit('click', WalletModalType.Trezor)
}
</script>

<template>
  <LayoutWalletConnectWrapperMini @click="showTrezorModal">
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
  </LayoutWalletConnectWrapperMini>
</template>
