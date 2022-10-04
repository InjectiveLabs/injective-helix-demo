<template>
  <div v-if="market" class="h-full">
    <!-- mobile table -->
    <TableBody
      :show-empty="trades.length === 0"
      class="sm:hidden max-h-lg overflow-y-auto"
    >
      <MobileTrade
        v-for="(trade, index) in trades"
        :key="`mobile-trade-history-${index}`"
        class="col-span-1"
        :trade="trade"
        is-spot
        @showTradeDetails="handleShowTradeDetails"
      />

      <EmptyList
        slot="empty"
        :message="$t('trade.emptyTrades')"
        class="min-h-orders"
      />
    </TableBody>

    <TableWrapper class="hidden sm:block">
      <table v-if="trades.length > 0" class="table">
        <TradesTableHeader />
        <tbody>
          <tr
            is="v-trade"
            v-for="(trade, index) in trades"
            :key="`trades-history-${index}`"
            :trade="trade"
            is-spot
          />
        </tbody>
      </table>
      <EmptyList v-else :message="$t('trade.emptyTrades')" />
    </TableWrapper>

    <ModalMobileTradeDetails is-spot :trade="tradeDetails" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotMarketWithToken,
  UiSpotTrade,
  UiSubaccount
} from '@injectivelabs/sdk-ui-ts'
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
    TradesTableHeader,
    TableBody
  },

  data() {
    return {
      tradeDetails: undefined as UiSpotTrade | undefined
    }
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    trades(): UiSpotTrade[] {
      return this.$accessor.spot.subaccountTrades
    },

    subAccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    }
  },

  methods: {
    handleShowTradeDetails(trade: UiSpotTrade) {
      this.tradeDetails = trade
      this.$accessor.modal.openModal({ type: Modal.MobileTradeDetails })
    }
  }
})
</script>
