<template>
  <WalletWrapper @click="handleClick">
    <template #icon>
      <IconMetamask class="w-8 h-8" />
    </template>
    <template #title>
      {{ $t('connect.metamask') }}
      <VButton
        v-if="!metamaskInstalled"
        text
        sm
        class="inline-flex items-center rounded"
        @click.stop="() => {}"
      >
        <a href="https://metamask.io/download" target="_blank" rel="noreferrer">
          {{ $t('connect.download') }}
        </a>
        <IconArrow class="transform rotate-180 w-3 h-3 ml-1" />
      </VButton>
    </template>
    <template #description>
      <span data-cy="connect-wallet-popup-metamask-button">
        {{ $t('connect.connectUsingBrowser') }}
      </span>
    </template>
  </WalletWrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import { Wallet } from '@injectivelabs/wallet-ts'
import WalletWrapper from './wallet-wrapper.vue'
import { WalletConnectStatus, AmplitudeEvents } from '~/types'

export default Vue.extend({
  components: {
    WalletWrapper
  },

  computed: {
    metamaskInstalled(): boolean {
      return this.$accessor.wallet.metamaskInstalled
    }
  },

  methods: {
    handleClick() {
      this.$amplitude.track(AmplitudeEvents.WalletSelected, {
        wallet: Wallet.Metamask
      })

      this.$accessor.wallet
        .connectMetamask()
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
