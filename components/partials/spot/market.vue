<template>
  <div v-if="market">
    <v-market :market="market" :summary="marketSummary" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotMarketSummary,
  UiSpotMarketWithTokenMeta
} from '@injectivelabs/ui-common'
import Market from '~/components/partials/common/market/index.vue'

export default Vue.extend({
  components: {
    'v-market': Market
  },

  computed: {
    market(): UiSpotMarketWithTokenMeta | undefined {
      return this.$accessor.spot.market
    },

    marketSummary(): UiSpotMarketSummary | undefined {
      return this.$accessor.spot.marketSummary
    }
  }
})
</script>
