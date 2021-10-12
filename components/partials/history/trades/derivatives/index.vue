<template>
  <div class="table-responsive min-h-orders max-h-xs 4xl:max-h-lg">
    <table class="table">
      <thead>
        <tr>
          <th class="text-left">
            {{ $t('market') }}
          </th>
          <th class="text-right">
            {{ $t('price') }}
          </th>
          <th class="text-right">
            {{ $t('amount') }}
          </th>
          <th class="text-right">
            {{ $t('notional_size') }}
          </th>
          <th class="text-right">
            {{ $t('fee') }}
          </th>
          <th class="text-center">
            {{ $t('side') }}
          </th>
          <th class="text-center">
            {{ $t('execution_type') }}
          </th>
          <th class="text-right">
            {{ $t('time') }}
          </th>
        </tr>
      </thead>
      <tbody v-if="isUserWalletConnected">
        <tr
          is="v-trade"
          v-for="(trade, index) in trades"
          :key="`trades-${index}-${trade.marketId}`"
          :trade="trade"
        ></tr>
      </tbody>
    </table>
    <v-user-wallet-connect-warning v-if="!isUserWalletConnected" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Trade from './trade.vue'
import { UiDerivativeTrade } from '~/types'

export default Vue.extend({
  components: {
    'v-trade': Trade
  },

  props: {
    trades: {
      required: true,
      type: Array as PropType<UiDerivativeTrade[]>
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
