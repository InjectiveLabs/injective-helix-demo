<template>
  <div>
    <h3 class="text-xl font-bold text-gray-200">
      {{ $t('dmm.summary.title') }}
    </h3>
    <v-card class="mt-6">
      <div class="p-2">
        <VElcsTable class="mt-6" />
        <VEvcsTable class="mt-6" />
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VElcsTable from './elcs-table.vue'
import VEvcsTable from './evcs-table.vue'
import { UiDerivativeMarket, UiSpotMarket } from '~/types'

export default Vue.extend({
  components: {
    VElcsTable,
    VEvcsTable
  },

  data() {
    return {
      totalTokens: '255,252',
      selectedMarket: null as
        | undefined
        | null
        | UiSpotMarket
        | UiDerivativeMarket
    }
  },

  computed: {
    derivativeMarkets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    spotMarkets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    },

    markets(): Array<UiSpotMarket | UiDerivativeMarket> {
      const { spotMarkets, derivativeMarkets } = this

      return [...derivativeMarkets, ...spotMarkets]
    }
  },

  mounted() {
    this.selectedMarket = this.markets.find(
      (market) => market.ticker === 'INJ/USDT'
    )
  },

  methods: {
    handleMarketChange(market: UiSpotMarket | UiDerivativeMarket) {
      this.selectedMarket = market
    }
  }
})
</script>
