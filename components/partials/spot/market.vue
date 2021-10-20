<template>
  <div v-if="market">
    <v-market :market="market" :summary="marketSummary" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Market from '~/components/partials/common/market/index.vue'
import { UiSpotMarket, UiSpotMarketSummary } from '~/types'

export default Vue.extend({
  components: {
    'v-market': Market
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    marketSummary(): UiSpotMarketSummary | undefined {
      return this.$accessor.spot.marketSummary
    }
  }
})
</script>
