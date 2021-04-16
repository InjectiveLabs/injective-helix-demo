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
              <span>{{ $t('size') }}</span>
            </th>
            <th is="v-ui-table-th" right>
              <span>{{ $t('notional_size') }}</span>
            </th>
            <th is="v-ui-table-th" right>
              <span>{{ $t('fee') }}</span>
            </th>
            <th is="v-ui-table-th" center>
              <span>{{ $t('direction') }}</span>
            </th>
            <th is="v-ui-table-th" center>
              <span>{{ $t('execution_type') }}</span>
            </th>
            <th is="v-ui-table-th" right>
              <span>{{ $t('time') }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
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
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Trade from './trade.vue'
import TradeEmpty from './trade-empty.vue'
import { UiSpotMarket, UiSpotMarketTrade } from '~/types'
import { UiSubaccount } from '~/types/subaccount'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    'v-trade-empty': TradeEmpty
  },

  data() {
    return {
      limit: 10
    }
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    trades(): UiSpotMarketTrade[] {
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
    this.onResize()
    window.addEventListener('resize', this.onResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },

  methods: {
    onResize() {
      //
    }
  }
})
</script>
