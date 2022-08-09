<template>
  <Wallet @click="handleClick">
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
  </Wallet>
</template>

<script lang="ts">
import Vue from 'vue'
import Wallet from './wallet.vue'

export default Vue.extend({
  components: {
    Wallet
  },

  methods: {
    handleClick() {
      this.$emit('wallet-ledger-connecting')
    }
  }
})
</script>
