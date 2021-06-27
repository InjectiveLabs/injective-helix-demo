<template>
  <v-panel v-if="market" class="h-full">
    <div class="flex flex-wrap items-center py-2 px-4 lg:py-1">
      <div class="flex items-center mr-4 mb-2 w-full md:w-auto lg:mb-0">
        <div class="leading-none">
          <p class="text-gray-100 font-semibold text-sm">{{ market.ticker }}</p>
          <p class="text-gray-500 text-xs">
            {{ market.baseToken.name }}
          </p>
        </div>
      </div>
      <v-market-stats class="flex-1" />
    </div>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import MarketStats from './stats.vue'
import { UiSpotMarket } from '~/types'

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
