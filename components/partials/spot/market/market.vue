<template>
  <v-panel v-if="market">
    <div class="flex flex-wrap items-center py-2 px-4 lg:py-1">
      <div class="flex items-center mr-4 mb-2 w-full lg:w-auto lg:mb-0">
        <img
          :src="market.baseToken.icon"
          :alt="market.baseToken.name"
          class="w-6 h-6 mr-4"
        />
        <div class="leading-none">
          <p class="mb-1">
            <v-ui-text md class="font-bold">{{ market.ticker }}</v-ui-text>
          </p>
          <p>
            <v-ui-text xs muted>{{ `${market.baseToken.name}` }}</v-ui-text>
          </p>
        </div>
      </div>
      <v-market-stats class="flex-grow" />
    </div>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiSpotMarket } from '~/types'
import MarketStats from './stats.vue'

export default Vue.extend({
  components: {
    'v-market-stats': MarketStats
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    }
  }
})
</script>
