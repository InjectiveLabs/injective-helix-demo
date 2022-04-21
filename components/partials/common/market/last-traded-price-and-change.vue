<template>
  <div class="flex flex-col items-end font-mono">
    <div
      class="flex items-center tracking-wide leading-none"
      :class="{ 'text-xs': !lg }"
    >
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
        :class="{
          'text-aqua-500': lastPriceChange !== Change.Decrease,
          'text-red-500': lastPriceChange === Change.Decrease
        }"
      >
        {{ lastTradedPriceToFormat }}
      </span>
      <span v-else class="text-gray-400">&mdash;</span>
    </div>

    <div v-if="!change.isNaN()" class="mt-1 text-xs">
      <span :class="change.gte(0) ? 'text-aqua-500' : 'text-red-500'">
        {{ changeToFormat }}%
      </span>
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
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { Change } from '~/types'

const { metaTags } = require('~/meta.config')

export default Vue.extend({
  props: {
    market: {
      type: Object as PropType<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      >,
      required: true
    },

    lg: {
      type: Boolean,
      default: false
    },

    summary: {
      type: Object as PropType<UiDerivativeMarketSummary | UiSpotMarketSummary>,
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
      const { lastTradedPrice, market } = this

      return lastTradedPrice.toFormat(
        market?.priceDecimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS
      )
    },

    quoteVolume(): BigNumberInBase {
      const { summary } = this

      if (!summary || !summary.volume) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.volume)
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
    }
  },

  watch: {
    lastTradedPriceToFormat(newPrice: string) {
      const { market } = this

      if (market) {
        document.title = `${newPrice} - ${market.ticker} | ${metaTags.title}`
      }
    }
  },

  beforeDestroy() {
    document.title = metaTags.title
  }
})
</script>
