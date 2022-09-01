<template>
  <WalletWrapper @click="handleClick">
    <template #icon>
      <IconTrezor class="w-8 h-8" />
    </template>
    <template #title>
      {{ $t('connect.trezor') }}
    </template>
    <template #description>
      <span data-cy="connect-wallet-popup-trezor-button">
        {{ $t('connect.connectUsingHardware') }}
      </span>
    </template>
  </WalletWrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import { Wallet } from '@injectivelabs/wallet-ts'
import WalletWrapper from './wallet-wrapper.vue'
import { AmplitudeEvents } from '~/types/enums'

export default Vue.extend({
  components: {
    WalletWrapper
  },

  methods: {
    handleClick() {
      this.$amplitude.track(AmplitudeEvents.WalletSelected, {
        wallet: Wallet.Trezor
      })

      this.$emit('wallet-trezor-connecting')
    }
  }
})
</script>
