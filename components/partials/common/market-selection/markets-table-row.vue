<template>
  <div
    class="grid grid-cols-3 text-gray-200 gap-4 text-xs px-3 py-2 bg-gray-900 items-center hover:bg-gray-850"
  >
    <span class="col-span-2">
      <nuxt-link
        class="flex items-center cursor-pointer justify-start"
        :to="marketRoute"
      >
        <img
          :src="market.baseToken.logo"
          :alt="market.baseToken.name"
          class="w-6 h-6 mr-3"
        />
        <div class="flex flex-col">
          <span class="font-semibold">{{ market.ticker }}</span>
          <span class="text-gray-500 tracking-wide mt-1">
            {{ abbreviatedVolumeInUsdToFormat }} USD
          </span>
        </div>
      </nuxt-link>
    </span>

    <v-last-traded-price-and-change :market="market" :summary="summary" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import VLastTradedPriceAndChange from '~/components/partials/common/market/last-traded-price-and-change.vue'
import { MarketRoute } from '~/types'
import { getAbbreviatedVolume, getMarketRoute } from '~/app/utils/market'

export default Vue.extend({
  components: {
    VLastTradedPriceAndChange
  },

  props: {
    market: {
      type: Object as PropType<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      >,
      required: true
    },

    summary: {
      type: Object as PropType<UiDerivativeMarketSummary | UiSpotMarketSummary>,
      required: true
    },

    volumeInUsd: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    }
  },

  computed: {
    volumeInUsdToFormat(): string {
      const { volumeInUsd } = this

      return volumeInUsd.toFormat(2)
    },

    abbreviatedVolumeInUsdToFormat(): string {
      const { volumeInUsd } = this

      return getAbbreviatedVolume(volumeInUsd)
    },

    marketRoute(): MarketRoute {
      const { market } = this

      const marketRoute = getMarketRoute(market)

      return marketRoute || { name: 'markets' }
    }
  }
})
</script>
