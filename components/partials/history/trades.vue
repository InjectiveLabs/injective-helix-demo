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
    'v-derivative-trade-history': VDerivativeTradeHistory
  },

  data() {
    return {
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

      return trades.filter((o) =>
        spotMarketsIds.includes(o.marketId)
      ) as UiSpotTrade[]
    },

    derivativesTrades(): UiDerivativeTrade[] {
      const { derivativeMarkets, trades } = this
      const derivativeMarketsIds = derivativeMarkets.map(
        ({ marketId }) => marketId
      )

      return trades.filter((o) =>
        derivativeMarketsIds.includes(o.marketId)
      ) as UiDerivativeTrade[]
    },

    currentTrades(): Array<UiSpotTrade | UiDerivativeTrade> {
      const { derivativesTrades, component, spotTrades } = this

      return component === components.derivativeTradeHistory
        ? derivativesTrades
        : spotTrades
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    }
  }
})
</script>
