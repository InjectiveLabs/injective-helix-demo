<template>
  <div
    id="market-slideout"
    class="slideout-menu bg-gray-800 fixed shadow-sm border-r left-0 top-0 bottom-0 w-xl min-h-screen hidden overflow-y-auto z-10"
  >
    <div class="mt-16 py-4 px-4">
      <v-list-simple :markets="markets" :summaries="marketsSummary" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// @ts-ignore
import Slideout from 'slideout'
import VListSimple from './list-simple.vue'
import {
  UiDerivativeMarket,
  UiDerivativeMarketSummary,
  UiSpotMarket,
  UiSpotMarketSummary
} from '~/types'

export default Vue.extend({
  components: {
    VListSimple
  },

  data() {
    return {
      slideout: null as any
    }
  },

  computed: {
    derivativeMarkets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    derivativeMarketsSummary(): UiDerivativeMarketSummary[] {
      return this.$accessor.derivatives.marketsSummary
    },

    spotMarkets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    },

    spotMarketsSummary(): UiSpotMarketSummary[] {
      return this.$accessor.spot.marketsSummary
    },

    markets(): Array<UiSpotMarket | UiDerivativeMarket> {
      const { spotMarkets, derivativeMarkets } = this

      return [...derivativeMarkets, ...spotMarkets]
    },

    marketsSummary(): Array<UiSpotMarketSummary | UiDerivativeMarketSummary> {
      const { spotMarketsSummary, derivativeMarketsSummary } = this

      return [...derivativeMarketsSummary, ...spotMarketsSummary]
    }
  },

  mounted() {
    this.slideout = new Slideout({
      panel: document.querySelector('main'),
      menu: document.getElementById('market-slideout'),
      padding: 576,
      tolerance: 70,
      easing: 'cubic-bezier(.32,2,.55,.27)'
    })

    this.$root.$on('toggle-market-slideout', () => this.slideout.toggle())
  }
})
</script>
