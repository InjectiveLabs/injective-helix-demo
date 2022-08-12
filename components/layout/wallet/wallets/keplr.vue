<template>
  <WalletWrapper @click="handleClick">
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
