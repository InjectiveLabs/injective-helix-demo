<template>
  <nuxt-link
    class="rounded-lg bg-transparent shadow-card p-4 bg-gray-950 bg-opacity-30 block"
    :to="marketRoute"
  >
    <div class="flex items-center justify-between text-gray-500">
      <p class="tracking-widest uppercase text-xs">
        <slot />
      </p>
    </div>
    <div class="flex justify-between mt-4">
      <div class="flex items-center">
        <div v-if="baseTokenLogo" class="w-8 h-8 mr-3">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div class="flex flex-col">
          <p
            data-cy="market-card-ticker-text-content"
            class="uppercase tracking-widest text-sm font-bold leading-4"
          >
            {{ market.ticker }}
          </p>
          <span class="text-xs text-gray-500 capitalize">
            {{ market.baseToken.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-start mt-4">
      <p
        class="text-xl tracking-wide font-mono font-semibold flex items-center mr-2"
        data-cy="market-card-last-traded-price-text-content"
        :class="{
          'text-green-500 ': summary.lastPriceChange === Change.Increase,
          'text-white': summary.lastPriceChange === Change.NoChange,
          'text-red-500': summary.lastPriceChange === Change.Decrease
        }"
      >
        {{ lastTradedPriceToFormat }}
      </p>

      <span
        class="text-sm font-mono"
        data-cy="market-card-change_24h-text-content"
        :class="{
          'text-green-500': change.gt(0),
          'text-white': change.eq(0),
          'text-red-500': change.lt(0)
        }"
      >
        {{ changeToFormat }}%
      </span>
    </div>

    <span
      class="text-gray-500 w-full text-sm"
      data-cy="market-card-volume-usd-text-content"
    >
      {{ $t('markets.vol') }}
      <span class="font-mono">{{ volumeInUsdToFormat }}</span> USD
    </span>
  </nuxt-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  getTokenLogoWithVendorPathPrefix,
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
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
