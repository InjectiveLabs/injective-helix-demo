<template>
  <div v-if="market">
    <v-market :market="market" :summary="marketSummary" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Market from '~/components/partials/common/market/index.vue'
import { UiDerivativeMarket, UiDerivativeMarketSummary } from '~/types'

export default Vue.extend({
  components: {
    'v-market': Market
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    marketSummary(): UiDerivativeMarketSummary | undefined {
      return this.$accessor.derivatives.marketSummary
    }
  }
})
</script>
