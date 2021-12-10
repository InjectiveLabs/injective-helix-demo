<template>
  <v-card-table-wrap>
    <template #filters>
      <v-button-filter
        v-model="component"
        :option="components.derivativeTradeHistory"
      >
        <span>
          {{ $t('derivatives_trade_history') }}
          {{ `(${derivativesTrades.length})` }}
        </span>
      </v-button-filter>
    </template>

    <template #context>
      <div class="hidden sm:block">
        <VSearch
          dense
          small
          :placeholder="$t('filter_by_market')"
          :search="search"
          @searched="updateSearch"
        />
      </div>
    </template>

    <template #mobile-context>
      <div class="sm:hidden p-1 mt-1">
        <VSearch
          dense
          small
          :placeholder="$t('filter_by_market')"
          :search="search"
          @searched="updateSearch"
        />
      </div>
    </template>

    <component
      :is="component"
      v-if="component"
      :trades="filteredDerivativesTrades"
    ></component>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import VDerivativeTradeHistory from './trades/derivative-trades.vue'
import VSearch from '~/components/inputs/search.vue'
import {
  UiDerivativeMarket,
  UiDerivativeTrade,
  UiSpotTrade
} from '~/types'

const components = {
  derivativeTradeHistory: 'v-derivative-trade-history'
}

export default Vue.extend({
  components: {
    'v-derivative-trade-history': VDerivativeTradeHistory,
    VSearch
  },

  data() {
    return {
      search: '',
      components,
      component: components.derivativeTradeHistory
    }
  },

  computed: {
    trades(): Array<UiSpotTrade | UiDerivativeTrade> {
      return this.$accessor.history.subaccountTrades
    },

    derivativeMarkets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    derivativesTrades(): UiDerivativeTrade[] {
      const { derivativeMarkets, trades } = this
      const derivativeMarketsIds = derivativeMarkets.map(
        ({ marketId }) => marketId
      )

      return trades
        .filter((o) => derivativeMarketsIds.includes(o.marketId))
        .map((trade) => ({
          ...trade,
          ticker:
            derivativeMarkets.find(
              (derivativeMarket) => trade.marketId === derivativeMarket.marketId
            )?.ticker || ''
        })) as UiDerivativeTrade[]
    },

    filteredDerivativesTrades(): UiDerivativeTrade[] {
      const { search, derivativesTrades } = this

      if (search.trim() === '') {
        return derivativesTrades
      }

      return derivativesTrades.filter(
        ({ ticker }) =>
          ticker && ticker.toLowerCase().includes(search.toLowerCase())
      )
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    },

    updateSearch(search: string) {
      this.search = search
    }
  }
})
</script>
