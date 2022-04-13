<template>
  <div v-if="market">
    <v-market :market="market" :summary="marketSummary" v-bind="$attrs" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken
} from '@injectivelabs/ui-common'
import Market from '~/components/partials/common/market/index.vue'

export default Vue.extend({
  components: {
    'v-market': Market
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
