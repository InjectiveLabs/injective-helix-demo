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
import WalletWrapper from './wallet-wrapper.vue'

export default Vue.extend({
  components: {
    WalletWrapper
  },

  methods: {
    handleClick() {
      this.$emit('wallet-ledger-connecting')
    }
  }
})
</script>
