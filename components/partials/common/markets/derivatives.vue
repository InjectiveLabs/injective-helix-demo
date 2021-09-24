<template>
  <div>
    <v-list
      :markets="markets"
      :summaries="marketsSummary"
      :type="MarketType.Derivative"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VList from './list.vue'
import {
  MarketType,
  UiDerivativeMarket,
  UiDerivativeMarketSummary
} from '~/types'

export default Vue.extend({
  components: {
    VList
  },

  data() {
    return {
      MarketType
    }
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
