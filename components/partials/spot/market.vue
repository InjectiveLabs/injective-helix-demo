<template>
  <div v-if="market">
    <v-market :market="market" :summary="marketSummary" v-bind="$attrs" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import Market from '~/components/partials/common/market/index.vue'

export default Vue.extend({
  components: {
    'v-market': Market
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    marketSummary(): UiSpotMarketSummary | undefined {
      return this.$accessor.spot.marketSummary
    }
  }
})
</script>
