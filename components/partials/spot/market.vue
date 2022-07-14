<template>
  <div v-if="market">
    <Market :market="market" :summary="marketSummary" v-bind="$attrs" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import Market from '~/components/partials/common/market/index.vue'

export default Vue.extend({
  components: {
    Market
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
