<template>
  <div class="flex-1">
    <div class="flex items-center justify-between">
      <div class="flex items-center justify-center">
        <v-button
          :class="{
            'text-gray-500': component !== components.derivativeTradeHistory
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.derivativeTradeHistory)"
        >
          <span>
            {{ $t('derivatives_trade_history') }}
            {{ `(${derivativesTrades.length})` }}
          </span>
        </v-button>
        <div class="mx-2 w-px h-4 bg-gray-500"></div>
        <v-button
          :class="{
            'text-gray-500': component !== components.spotTradeHistory
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.spotTradeHistory)"
        >
          <span>
            {{ $t('spot_trade_history') }} {{ `(${spotTrades.length})` }}
          </span>
        </v-button>
      </div>
    </div>

    <div class="bg-gray-900 px-4 py-2 rounded-lg mt-2">
      <component
        :is="component"
        v-if="component"
        :trades="currentTrades"
      ></component>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VSpotTradeHistory from './trades/spot/index.vue'
import VDerivativeTradeHistory from './trades/derivatives/index.vue'
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
