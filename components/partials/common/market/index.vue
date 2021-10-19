<template>
  <div class="bg-gray-800 shadow-sm px-4 py-1 rounded-xl">
    <div class="flex flex-wrap items-center mt-1 py-2 lg:py-1">
      <div class="flex items-center pr-4 w-autojustify-start border-r">
        <img
          :src="market.baseToken.icon"
          :alt="market.baseToken.name"
          class="w-6 h-6 mr-4"
        />
        <div class="leading-none">
          <p class="text-gray-100 font-semibold text-sm">{{ market.ticker }}</p>
          <p class="text-gray-500 text-xs">
            {{ market.baseToken.name }}
          </p>
        </div>
      </div>
      <v-market-stats
        :market="market"
        :summary="summary"
        class="flex-1 mt-4 md:mt-0 overflow-x-auto"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import MarketStats from './stats.vue'
import {
  UiDerivativeMarket,
  UiDerivativeMarketSummary,
  UiSpotMarket,
  UiSpotMarketSummary
} from '~/types'

export default Vue.extend({
  components: {
    'v-market-stats': MarketStats
  },

  props: {
    market: {
      type: Object as PropType<UiSpotMarket | UiDerivativeMarket>,
      required: true
    },

    summary: {
      type: Object as PropType<UiSpotMarketSummary | UiDerivativeMarketSummary>,
      required: true
    }
  }
})
</script>
