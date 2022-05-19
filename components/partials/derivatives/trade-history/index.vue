<template>
  <div v-if="market" class="h-full">
    <!-- mobile table -->
    <TableBody
      :show-empty="filteredTrades.length === 0"
      class="sm:hidden max-h-lg overflow-y-auto"
    >
      <MobileTrade
        v-for="(trade, index) in filteredTrades"
        :key="`mobile-trade-history-${index}`"
        class="col-span-1"
        :trade="trade"
      />

      <v-empty-list
        slot="empty"
        :message="$t('trade.emptyTrades')"
        class="mt-6 min-h-orders"
      />
    </TableBody>

    <v-table-wrapper class="hidden sm:block">
      <table v-if="filteredTrades.length > 0" class="table">
        <trades-table-header />
        <tbody>
          <tr
            is="v-trade"
            v-for="(trade, index) in filteredTrades"
            :key="`trades-history-${index}`"
            :trade="trade"
          />
        </tbody>
      </table>
      <v-empty-list v-else :message="$t('trade.emptyTrades')" />
    </v-table-wrapper>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiDerivativeTrade
} from '@injectivelabs/ui-common'
import MobileTrade from '~/components/partials/common/derivatives/mobile-trade.vue'
import Trade from '~/components/partials/common/derivatives/trade.vue'
import TradesTableHeader from '~/components/partials/common/derivatives/trades-table-header.vue'
import TableBody from '~/components/elements/table-body.vue'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    MobileTrade,
    TableBody,
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
