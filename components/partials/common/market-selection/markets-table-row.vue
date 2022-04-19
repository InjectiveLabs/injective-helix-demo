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

    <!-- Mobile column -->
    <div class="flex flex-col items-end">
      <div class="flex items-center">
        <v-icon-arrow
          v-if="!lastTradedPrice.isNaN() && lastTradedPrice.gt(0)"
          class="transform w-3 h-3 mr-1"
          :class="{
            'text-aqua-500 rotate-90': lastPriceChange !== Change.Decrease,
            'text-red-500 -rotate-90': lastPriceChange === Change.Decrease
          }"
        />
        <span
          v-if="!lastTradedPrice.isNaN()"
          class=""
          :class="{
            'text-aqua-500': lastPriceChange !== Change.Decrease,
            'text-red-500': lastPriceChange === Change.Decrease
          }"
        >
          {{ lastTradedPriceToFormat }}
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </div>

      <div v-if="!change.isNaN()" class="mt-1">
        <span :class="change.gte(0) ? 'text-aqua-500' : 'text-red-500'">
          {{ changeToFormat }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  MarketType,
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { Change, MarketRoute } from '~/types'
import { getAbbreviatedVolume, getMarketRoute } from '~/app/utils/market'

export default Vue.extend({
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

  data() {
    return {
      Change
    }
  },

  computed: {
    currentSpotMarket(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    currentDerivativeMarket(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    currentLastSpotTradedPrice(): BigNumberInBase {
      return this.$accessor.spot.lastTradedPrice
    },

    currentLastDerivativeTradedPrice(): BigNumberInBase {
      return this.$accessor.derivatives.lastTradedPrice
    },

    /* Current market is the market that we are currently trading on */
    currentMarket():
      | UiSpotMarketWithToken
      | UiDerivativeMarketWithToken
      | undefined {
      const { currentSpotMarket, currentDerivativeMarket, market } = this

      return market.type === MarketType.Spot
        ? currentSpotMarket
        : currentDerivativeMarket
    },

    currentLastTradedPrice(): BigNumberInBase {
      const {
        currentLastSpotTradedPrice,
        currentLastDerivativeTradedPrice,
        market
      } = this

      return market.type === MarketType.Spot
        ? currentLastSpotTradedPrice
        : currentLastDerivativeTradedPrice
    },

    lastTradedPrice(): BigNumberInBase {
      const { market, currentMarket, currentLastTradedPrice, summary } = this

      if (!market || !summary || !summary.price) {
        return ZERO_IN_BASE
      }

      if (
        currentMarket &&
        currentMarket.marketId === market.marketId &&
        currentLastTradedPrice
      ) {
        return currentLastTradedPrice
      }

      return new BigNumberInBase(summary.lastPrice || summary.price)
    },

    lastTradedPriceToFormat(): string {
      const { lastTradedPrice } = this

      return lastTradedPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
    },

    quoteVolume(): BigNumberInBase {
      const { summary } = this

      if (!summary || !summary.volume) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.volume)
    },

    baseVolume(): BigNumberInBase {
      const { quoteVolume, lastTradedPrice } = this

      if (quoteVolume.eq('0')) {
        return ZERO_IN_BASE
      }

      return quoteVolume.dividedBy(lastTradedPrice)
    },

    baseVolumeToFormat(): string {
      const { baseVolume } = this

      return baseVolume.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    },

    volumeInUsdToFormat(): string {
      const { volumeInUsd } = this

      return volumeInUsd.toFormat(2)
    },

    abbreviatedVolumeInUsdToFormat(): string {
      const { volumeInUsd } = this

      return getAbbreviatedVolume(volumeInUsd)
    },

    change(): BigNumberInBase {
      const { summary } = this

      if (!summary || !summary.change) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.change)
    },

    changeToFormat(): string {
      const { change } = this

      return change.toFormat(2)
    },

    lastPriceChange(): Change {
      const { summary } = this

      if (!summary) {
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
    }
  }
})
</script>
