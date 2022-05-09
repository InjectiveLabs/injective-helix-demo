<template>
  <nuxt-link
    class="rounded-2xl bg-transparent shadow-card p-4 bg-white bg-opacity-5 block"
    :to="marketRoute"
  >
    <div class="flex items-center justify-between text-gray-500">
      <p class="tracking-widest uppercase text-xs">
        <slot />
      </p>

      <v-powered-by v-if="isBaycWeth" />
    </div>
    <div class="flex justify-between mt-4">
      <div class="flex items-center">
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
      </div>
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
        v-if="lastTradedPrice.gt(0)"
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
        :class="change.gte(0) ? 'text-aqua-500' : 'text-red-500'"
      >
        {{ changeToFormat }}%
      </span>
      <span class="text-gray-500 uppercase">
        {{ $t('markets.vol') }} {{ volumeInUsdToFormat }} USD
      </span>
    </div>
  </nuxt-link>
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
import VPoweredBy from '~/components/partials/markets/powered-by.vue'
import { Change, MarketRoute } from '~/types'
import {
  BAYC_WETH_PERP_SLUG,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { getMarketRoute } from '~/app/utils/market'

export default Vue.extend({
  components: {
    VPoweredBy
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
      const { lastTradedPrice, market } = this

      return lastTradedPrice.toFormat(
        market?.priceDecimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
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

      return volumeInUsd.toFormat(2, BigNumberInBase.ROUND_DOWN)
    },

    marketRoute(): MarketRoute {
      const { market } = this

      const marketRoute = getMarketRoute(market)

      return marketRoute || { name: 'index' }
    },

    isBaycWeth(): boolean {
      const { market } = this

      if (!market || !market.slug) {
        return false
      }

      return market.slug === BAYC_WETH_PERP_SLUG
    }
  }
})
</script>
