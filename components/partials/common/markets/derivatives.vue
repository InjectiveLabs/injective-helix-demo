<template>
  <div>
    <v-list :markets="markets" :summaries="marketsSummary" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VList from './list.vue'
import { UiDerivativeMarket, UiDerivativeMarketSummary } from '~/types'

export default Vue.extend({
  components: {
    VList
  },

  computed: {
    markets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    marketsSummary(): UiDerivativeMarketSummary[] {
      return this.$accessor.derivatives.marketsSummary
    }
  }
})
</script>
