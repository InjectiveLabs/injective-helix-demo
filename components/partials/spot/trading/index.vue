<template>
  <v-panel
    :class="{ 'wallet-not-connected': !isUserWalletConnected }"
    :title="$t('trading')"
  >
    <v-ui-overlay v-if="!isUserWalletConnected">
      <p class="text-center">{{ $t('not_connected_trading') }}</p>
    </v-ui-overlay>
    <template v-else>
      <v-trade />
    </template>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import Trade from './trade.vue'

export default Vue.extend({
  components: {
    'v-trade': Trade
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
