<template>
  <WalletWrapper @click="handleClick">
    <template #icon>
      <IconCosmostation class="w-8 h-8" />
    </template>
    <template #title>
      {{ $t('connect.cosmostation') }}
    </template>
    <template #description>
      <span data-cy="connect-wallet-popup-ledger-button">
        {{ $t('connect.connectUsingBrowser') }}
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
        .connectCosmostation()
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
