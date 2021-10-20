<template>
  <v-slideout
    :is-open="isSlideoutOpen"
    show-header
    @slideout-closed="closeSlideout"
  >
    <div>
      <v-table :markets="markets" :summaries="marketsSummary" simple />
    </div>
  </v-slideout>
</template>

<script lang="ts">
import Vue from 'vue'
import VTable from './table.vue'
import VSlideout from '~/components/elements/slideout.vue'
import {
  UiDerivativeMarket,
  UiDerivativeMarketSummary,
  UiSpotMarket,
  UiSpotMarketSummary
} from '~/types'

export default Vue.extend({
  components: {
    VTable,
    VSlideout
  },

  data() {
    return {
      isSlideoutOpen: false
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
    this.$root.$on('toggle-market-slideout', this.toggleSlideout)
  },

  methods: {
    toggleSlideout() {
      this.isSlideoutOpen = !this.isSlideoutOpen
    },

    closeSlideout() {
      if (this.isSlideoutOpen) {
        this.isSlideoutOpen = false
      }
    }
  }
})
</script>
