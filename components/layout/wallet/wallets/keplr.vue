<template>
  <Wallet @click="handleClick">
    <template #icon>
      <img src="/keplr-icon.png" class="w-8 h-8" alt="Keplr Icon" />
    </template>
    <template #title>
      {{ $t('connect.keplr') }}
    </template>
    <template #description>
      <span data-cy="connect-wallet-popup-keplr-button">
        {{ $t('connect.connectUsingKeplr') }}
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
        .connectKeplr()
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
