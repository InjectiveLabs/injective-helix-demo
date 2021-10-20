<template>
  <div class="table-responsive min-h-orders max-h-xs 4xl:max-h-lg">
    <table class="table">
      <trades-table-header market-column-enabled />
      <tbody v-if="isUserWalletConnected">
        <tr
          is="v-trade"
          v-for="(trade, index) in trades"
          :key="`trades-${index}-${trade.marketId}`"
          :trade="trade"
        ></tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Trade from '~/components/partials/common/derivatives/trade.vue'
import TradesTableHeader from '~/components/partials/common/derivatives/trades-table-header.vue'
import { UiDerivativeTrade } from '~/types'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    TradesTableHeader
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
