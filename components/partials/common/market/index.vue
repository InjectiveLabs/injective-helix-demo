<template>
  <div class="bg-gray-800 shadow-sm px-4 py-1 rounded-xl">
    <div
      class="mt-1 py-2 lg:py-1 cursor-pointer grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4"
    >
      <div class="flex items-center w-auto justify-between lg:pr-5">
        <div class="flex items-center" @click="handleTokenClick">
          <img
            :src="market.baseToken.logo"
            :alt="market.baseToken.name"
            class="w-6 h-6 mr-4"
          />
          <div class="leading-none select-none">
            <p class="text-gray-100 font-semibold text-sm flex items-center">
              <span>{{ market.ticker }}</span>
              <v-icon-chevron
                class="w-auto h-3 text-gray-500 ml-2 transform transition ease-in-out duration-300"
                :class="[expanded ? 'rotate-90' : '-rotate-90']"
              />
            </p>
            <p class="text-gray-500 text-xs">
              {{ market.baseToken.name }}
            </p>
          </div>
        </div>

        <div class="w-px h-8 border-r hidden lg:block" />

        <v-last-traded-price-and-change
          :market="market"
          :summary="summary"
          lg
          update-tab
        />
      </div>

      <v-market-stats
        :market="market"
        :summary="summary"
        class="mt-4 lg:mt-0 flex-1 overflow-x-auto col-span-2 2xl:col-span-3"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import VMarketStats from './stats.vue'
import VLastTradedPriceAndChange from './last-traded-price-and-change.vue'

export default Vue.extend({
  components: {
    VLastTradedPriceAndChange,
    VMarketStats
  },

  props: {
    market: {
      type: Object as PropType<
        UiSpotMarketWithToken | UiDerivativeMarketWithToken
      >,
      required: true
    },

    summary: {
      type: Object as PropType<UiSpotMarketSummary | UiDerivativeMarketSummary>,
      required: true
    },

    expanded: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleTokenClick() {
      this.$root.$emit('toggle-market-list')
    }
  }
})
</script>
