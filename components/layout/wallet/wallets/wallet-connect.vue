<template>
  <WalletWrapper @click="handleClick">
    <template #icon>
      <IconWalletConnect class="w-8 h-8" />
    </template>
    <template #title>
      {{ $t('connect.walletConnect') }}
    </template>
    <template #description>
      <span data-cy="connect-wallet-popup-wallet-connect-button">
        {{ $t('connect.connectUsingWalletConnect') }}
      </span>
    </template>
  </WalletWrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import WalletWrapper from './wallet-wrapper.vue'
import { WalletConnectStatus } from '~/types'

export default Vue.extend({
  components: {
    WalletWrapper
  },

  methods: {
    handleClick() {
      this.$accessor.wallet
        .connectWalletConnect()
        .then(() => {
          this.$emit('wallet-connected')
        })
        .catch((e) => {
          this.$accessor.wallet.setWalletConnectStatus(
            WalletConnectStatus.disconnected
          )
          this.$onError(e)
        })
    }
  }
})
</script>
