<template>
  <div class="flex flex-col">
    <div
      v-if="market"
      ref="tradesHistory"
      class="table-responsive table-compact"
    >
      <table class="table">
        <thead class="border-b">
          <tr>
            <th is="v-ui-table-th" right>
              <span>{{ $t('price') }}</span>
            </th>
            <th is="v-ui-table-th" right>
              <span>{{ $t('amount') }}</span>
            </th>
            <th is="v-ui-table-th" right>
              <span>{{ $t('notional_size') }}</span>
            </th>
            <th is="v-ui-table-th" right>
              <span>{{ $t('fee') }}</span>
            </th>
            <th is="v-ui-table-th" center>
              <span>{{ $t('side') }}</span>
            </th>
            <th is="v-ui-table-th" center>
              <span>{{ $t('execution_type') }}</span>
            </th>
            <th is="v-ui-table-th" right>
              <span>{{ $t('time') }}</span>
            </th>
          </tr>
        </thead>
        <tbody v-if="isUserWalletConnected">
          <tr
            is="v-trade"
            v-for="(trade, index) in trades"
            :key="`trades-history-${index}-`"
            :trade="trade"
          ></tr>
          <tr
            is="v-trade-empty"
            v-for="(trade, index) in emptyTrades"
            :key="`empty-trades-${index}`"
          ></tr>
        </tbody>
        <tbody v-else>
          <tr class="relative h-8">
            <th colspan="7" class="w-full" :rowspan="limit">
              <v-ui-overlay>
                <p>{{ $t('not_connect_trades') }}</p>
              </v-ui-overlay>
            </th>
          </tr>
          <tr
            v-for="(order, index) in [...emptyTrades.slice(1)]"
            :key="`empty-trades-${index}`"
            class="h-8"
          >
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumber } from '@injectivelabs/utils'
import Trade from './trade.vue'
import TradeEmpty from './trade-empty.vue'
import { UiSpotMarket, UiSpotTrade } from '~/types'
import { UiSubaccount } from '~/types/subaccount'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    'v-trade-empty': TradeEmpty
  },

  data() {
    return {
      limit: 9
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    trades(): UiSpotTrade[] {
      return this.$accessor.spot.subaccountTrades
    },

    subAccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    emptyTrades(): any[] {
      const { trades, limit } = this

      return trades.length < limit ? new Array(limit - trades.length) : []
    }
  },

  watch: {
    subAccount() {
      this.$accessor.spot.fetchSubaccountMarketTrades()
    }
  },

  mounted() {
    this.$root.$on('resized-trades-panel', this.onResize)

    this.$nextTick(() => {
      setTimeout(() => {
        this.onResize()
      }, 20)
    })
  },

  methods: {
    onResize() {
      const panelContent = this.$el.closest('.v-panel-content') as HTMLElement

      if (!panelContent) {
        return
      }

      const height = panelContent.offsetHeight
      const rowSize = 32
      const titleHeight = 48
      const totalContentHeight = new BigNumber(height - titleHeight)

      this.limit = totalContentHeight
        .div(rowSize)
        .decimalPlaces(0, BigNumber.ROUND_HALF_CEIL)
        .toNumber()
    }
  }
})
</script>
