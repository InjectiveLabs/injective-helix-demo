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
        @showTradeDetails="handleShowTradeDetails"
      />

      <v-empty-list
        slot="empty"
        :message="$t('trade.emptyTrades')"
        class="min-h-orders"
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

    <ModalMobileTradeDetails :trade="tradeDetails" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiDerivativeTrade
} from '@injectivelabs/ui-common'
import MobileTrade from '~/components/partials/common/trade/mobile-trade.vue'
import ModalMobileTradeDetails from '~/components/partials/modals/mobile-trade-details.vue'
import Trade from '~/components/partials/common/trade/trade.vue'
import TradesTableHeader from '~/components/partials/common/trade/trades-table-header.vue'
import TableBody from '~/components/elements/table-body.vue'
import { Modal } from '~/types'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    MobileTrade,
    ModalMobileTradeDetails,
    TableBody,
    TradesTableHeader
  },

  props: {
    currentMarketOnly: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      tradeDetails: undefined as UiDerivativeTrade | undefined
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
  },

  methods: {
    handleShowTradeDetails(trade: UiDerivativeTrade) {
      this.tradeDetails = trade
      this.$accessor.modal.openModal(Modal.MobileTradeDetails)
    }
  }
})
</script>
