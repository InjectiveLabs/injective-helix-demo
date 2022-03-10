<template>
  <v-table-wrapper v-if="market">
    <table v-if="filteredTrades.length > 0" class="table">
      <trades-table-header />
      <tbody>
        <tr
          is="v-trade"
          v-for="(trade, index) in filteredTrades"
          :key="`trades-history-${index}-`"
          :trade="trade"
        />
      </tbody>
    </table>
    <v-empty-list v-else :message="$t('trade.emptyTrades')" />
  </v-table-wrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiDerivativeTrade
} from '@injectivelabs/ui-common'
import Trade from '~/components/partials/common/derivatives/trade.vue'
import TradesTableHeader from '~/components/partials/common/derivatives/trades-table-header.vue'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    TradesTableHeader
  },

  props: {
    currentMarketOnly: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    trades(): UiDerivativeTrade[] {
      return this.$accessor.derivatives.subaccountTrades
    },

    filteredTrades(): UiDerivativeTrade[] {
      const { currentMarketOnly, market, trades } = this

      if (!currentMarketOnly) {
        return trades
      }

      return trades.filter((trade) => trade.marketId === market?.marketId)
    }
  }
})
</script>
