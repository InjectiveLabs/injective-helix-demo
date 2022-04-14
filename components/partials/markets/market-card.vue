<template>
  <div class="rounded-2xl bg-transparent shadow-card p-4 bg-white bg-opacity-5">
    <p class="tracking-widest uppercase text-gray-500 text-xs">
      <slot />
    </p>
    <div class="flex justify-between mt-4">
      <nuxt-link class="flex items-center" :to="marketRoute">
        <div v-if="market.baseToken.logo" class="w-8 h-8 mr-3">
          <img
            :src="market.baseToken.logo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div class="flex flex-col">
          <p class="uppercase tracking-widest text-sm font-bold leading-4">
            {{ market.ticker }}
          </p>
          <span class="text-xs text-gray-500 capitalize">
            {{ market.baseToken.name }}
          </span>
        </div>
      </nuxt-link>
      <!-- V2: spark line chart -->
    </div>

    <p
      class="text-2xl tracking-wide font-mono font-light flex items-center mt-4"
      :class="{
        'text-aqua-500 ': summary.lastPriceChange !== Change.Decrease,
        'text-red-500': summary.lastPriceChange === Change.Decrease
      }"
    >
      <v-icon-arrow
        v-if="volumeInUsd.gt(0)"
        class="transform w-5 h-5 mr-1"
        :class="{
          'rotate-90': summary.lastPriceChange !== Change.Decrease,
          ' -rotate-90': summary.lastPriceChange === Change.Decrease
        }"
      />

      {{ lastTradedPriceToFormat }}
    </p>
    <div class="flex items-center font-mono text-sm tracking-wide mt-2">
      <span
        class="mr-2"
        :class="{
          'text-aqua-500 ': summary.lastPriceChange !== Change.Decrease,
          'text-red-500': summary.lastPriceChange === Change.Decrease
        }"
      >
        {{ changeToFormat }}%
      </span>
      <span class="text-gray-500">VOL {{ volumeInUsdToFormat }} USD</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Change, MarketRoute } from '~/types'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { getMarketRoute } from '~/app/utils/market'

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
    lastTradedPrice(): BigNumberInBase {
      const { summary } = this

      if (!summary || !summary.price) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.lastPrice || summary.price)
    },

    lastTradedPriceToFormat(): string {
      const { lastTradedPrice } = this

      return lastTradedPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
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

    volumeInUsdToFormat(): string {
      const { volumeInUsd } = this

      return volumeInUsd.toFormat(2)
    },

    marketRoute(): MarketRoute {
      const { market } = this

      const marketRoute = getMarketRoute(market)

      return marketRoute || { name: 'index' }
    }
  }
})
</script>
