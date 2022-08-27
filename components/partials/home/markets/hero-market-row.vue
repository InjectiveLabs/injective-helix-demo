<template>
  <nuxt-link :to="marketRoute">
    <div
      class="grid grid-cols-12 items-center border-b border-helixGray-200 last-of-type:border-b-1 py-[10px] gap-12 box-content"
    >
      <div class="col-span-4 flex items-center justify-start pl-4">
        <div class="flex items-center justify-start">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="w-4 h-4 md:w-6 md:h-6 mr-4"
          />
          <div
            class="mr-4 text-left text-helixGray-500 text-sm font-bold whitespace-nowrap mb-1"
          >
            <div class="flex">
              {{ market.ticker }}
            </div>
            <span class="text-helixGray-300 text-xs">
              {{ market.baseToken.name }}
            </span>
          </div>
        </div>
      </div>
      <div class="col-span-3 flex">
        <span class="w-full text-gray-900 font-medium text-sm text-right">
          <div class="flex align-center justify-end">
            <IconArrow
              v-if="!lastTradedPrice.isNaN()"
              class="transform w-3 h-3 mr-1 mt-1"
              :class="{
                'text-green-500 rotate-90': lastPriceChange !== Change.Decrease,
                'text-red-500 -rotate-90': lastPriceChange === Change.Decrease
              }"
            />
            <span
              v-if="!lastTradedPrice.isNaN()"
              :class="{
                'text-green-500': lastPriceChange !== Change.Decrease,
                'text-red-500': lastPriceChange === Change.Decrease
              }"
            >
              {{ lastTradedPriceToFormat }}
            </span>
            <span v-else class="text-gray-400">&mdash;</span>
          </div>
        </span>
      </div>
      <div class="col-span-2 flex">
        <span
          v-if="!change.isNaN()"
          :class="change.gte(0) ? 'text-green-500' : 'text-red-500'"
        >
          {{ changeToFormat }}%
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </div>
      <div class="col-span-3 flex pr-4 h-7">
        <LineGraph
          :data="chartData"
          :color="'#f3164d'"
          :bg-type="'transparent'"
          :stroke-width="1"
          :smoothness="0.2"
        />
      </div>
    </div>
  </nuxt-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
// @ts-ignore
import { LineGraph } from 'vue-plot'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  ZERO_IN_BASE,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { Change, MarketRoute } from '~/types'
import { betaMarketSlugs } from '~/app/data/market'
import { getMarketRoute } from '~/app/utils/market'

export default Vue.extend({
  components: {
    LineGraph
  },

  props: {
    market: {
      required: true,
      type: Object as PropType<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      >
    },

    summary: {
      required: true,
      type: Object as PropType<UiDerivativeMarketSummary | UiSpotMarketSummary>
    }
  },

  data() {
    return {
      Change,
      chartData: [
        [0, 670.083],
        [63, 648.297],
        [126, 609.14],
        [189, 618.952],
        [252, 544.733],
        [315, 521.324],
        [378, 521.982],
        [441, 465.814],
        [504, 493.411],
        [567, 371.442],
        [630, 466.558],
        [693, 302.238],
        [756, 345.249],
        [819, 329.911],
        [882, 259.528],
        [945, 145.526],
        [1008, 110.93],
        [1071, 179.909],
        [1134, 186.363],
        [1197, 50]
      ]
    }
  },

  computed: {
    lastTradedPrice(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.price)
    },

    lastTradedPriceToFormat(): string {
      const { market, lastTradedPrice } = this

      if (!market) {
        return lastTradedPrice.toFormat(
          UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
          BigNumberInBase.ROUND_DOWN
        )
      }

      return lastTradedPrice.toFormat(
        market.priceDecimals,
        BigNumberInBase.ROUND_DOWN
      )
    },

    isMarketBeta(): boolean {
      const { market } = this

      if (!market) {
        return false
      }

      return betaMarketSlugs.includes(market.slug)
    },

    volume(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.volume)
    },

    volumeToFormat(): string {
      const { volume } = this

      return volume.toFormat(0, BigNumberInBase.ROUND_DOWN)
    },

    change(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.change)
    },

    changeToFormat(): string {
      const { change } = this

      return change.toFormat(2, BigNumberInBase.ROUND_DOWN)
    },

    lastPriceChange(): Change {
      const { market, summary } = this

      if (!market || !summary) {
        return Change.NoChange
      }

      if (!summary.lastPriceChange) {
        return Change.NoChange
      }

      return summary.lastPriceChange
    },

    marketRoute(): MarketRoute {
      const { market } = this

      const marketRoute = getMarketRoute(market)

      return marketRoute || { name: 'markets' }
    },

    baseTokenLogo(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      if (!market.baseToken) {
        return ''
      }

      return getTokenLogoWithVendorPathPrefix(market.baseToken.logo)
    }
  }
})
</script>
