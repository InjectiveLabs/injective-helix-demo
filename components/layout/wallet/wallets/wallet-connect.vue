<template>
  <Wallet @click="handleClick">
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
  </Wallet>
</template>

<script lang="ts">
import Vue from 'vue'
import Wallet from './wallet.vue'
import { WalletConnectStatus } from '~/types'

export default Vue.extend({
  components: {
    Wallet
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
