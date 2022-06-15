<template>
  <div v-if="market">
    <Market :market="market" :summary="marketSummary" v-bind="$attrs" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import Market from '~/components/partials/common/market/index.vue'

export default Vue.extend({
  components: {
    Market
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    marketSummary(): UiDerivativeMarketSummary | undefined {
      return this.$accessor.derivatives.marketSummary
    }
  }
})
</script>
