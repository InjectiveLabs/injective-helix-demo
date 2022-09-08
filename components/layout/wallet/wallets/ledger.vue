<template>
  <WalletWrapper @click="handleClick">
    <template #icon>
      <IconLedger class="w-8 h-8" />
    </template>
    <template #title>
      {{ $t('connect.ledger') }}
    </template>
    <template #description>
      <span data-cy="connect-wallet-popup-ledger-button">
        {{ $t('connect.connectUsingHardware') }}
      </span>
    </template>
  </WalletWrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import { Wallet } from '@injectivelabs/ts-types'
import WalletWrapper from './wallet-wrapper.vue'
import { submitWalletSelectedTrackEvent } from '~/app/client/utils/amplitude'

export default Vue.extend({
  components: {
    WalletWrapper
  },

  methods: {
    handleClick() {
      submitWalletSelectedTrackEvent(Wallet.Ledger)

      this.$emit('wallet-ledger-connecting')
    }
  }
})
</script>
