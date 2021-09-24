<template>
  <div>
    <v-list :markets="markets" :summaries="marketsSummary" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VList from './list.vue'
import { UiSpotMarket, UiSpotMarketSummary } from '~/types'

export default Vue.extend({
  components: {
    VList
  },

  computed: {
    markets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    },

    marketsSummary(): UiSpotMarketSummary[] {
      return this.$accessor.spot.marketsSummary
    }
  }
})
</script>
