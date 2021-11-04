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
      <div class="mx-2 w-px h-4 bg-gray-500"></div>
      <v-button-filter
        v-model="component"
        :option="components.spotTradeHistory"
      >
        <span>
          {{ $t('spot_trade_history') }} {{ `(${spotTrades.length})` }}
        </span>
      </v-button-filter>
    </template>

    <template #context>
      <div class="hidden sm:block">
        <VSearch dense small :search="search" @searched="updateSearch" />
      </div>
    </template>

    <template #mobile-context>
      <div class="sm:hidden p-1 mt-1">
        <VSearch dense small :search="search" @searched="updateSearch" />
      </div>
    </template>

    <component
      :is="component"
      v-if="component"
      :trades="currentTrades"
    ></component>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import VSpotTradeHistory from './trades/spot-trades.vue'
import VDerivativeTradeHistory from './trades/derivative-trades.vue'
import VSearch from '~/components/inputs/search.vue'
import {
  UiDerivativeMarket,
  UiDerivativeTrade,
  UiSpotMarket,
  UiSpotTrade
} from '~/types'

const components = {
  spotTradeHistory: 'v-spot-trade-history',
  derivativeTradeHistory: 'v-derivative-trade-history'
}

export default Vue.extend({
  components: {
    'v-spot-trade-history': VSpotTradeHistory,
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

    spotMarkets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    },

    spotTrades(): UiSpotTrade[] {
      const { spotMarkets, trades } = this
      const spotMarketsIds = spotMarkets.map(({ marketId }) => marketId)

      return trades
        .filter((o) => {
          return spotMarketsIds.includes(o.marketId)
        })
        .map((trade) => ({
          ...trade,
          ticker:
            spotMarkets.find(
              (spotMarket) => trade.marketId === spotMarket.marketId
            )?.ticker || ''
        })) as UiSpotTrade[]
    },

    filteredSpotTrades(): UiSpotTrade[] {
      const { search, spotTrades } = this

      if (search.trim() === '') {
        return spotTrades
      }

      return spotTrades.filter(
        ({ ticker }) =>
          ticker && ticker.toLowerCase().includes(search.toLowerCase())
      )
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
    },

    currentTrades(): Array<UiSpotTrade | UiDerivativeTrade> {
      const { filteredDerivativesTrades, component, filteredSpotTrades } = this

      return component === components.derivativeTradeHistory
        ? filteredDerivativesTrades
        : filteredSpotTrades
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
