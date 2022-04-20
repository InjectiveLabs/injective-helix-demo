<template>
  <div
    class="grid grid-cols-3 sm:grid-cols-10 3md:grid-cols-12 text-gray-200 gap-4 text-sm px-4 py-5 mb-1 bg-gray-800 bg-opacity-50 items-center rounded"
  >
    <span class="text-sm col-span-2 sm:col-span-3 flex items-center">
      <div
        class="3md:hidden text-primary-500 mr-3 cursor-pointer"
        @click="updateWatchList"
      >
        <v-icon-star v-if="isFavourite" class="min-w-6 w-6 h-6" />
        <v-icon-star-border v-else class="min-w-6 w-6 h-6" />
      </div>

      <nuxt-link class="cursor-pointer flex items-center" :to="marketRoute">
        <img
          :src="market.baseToken.logo"
          :alt="market.baseToken.name"
          class="w-6 h-6 mr-3 hidden 3md:block"
        />
        <div class="flex flex-col">
          <span class="tracking-widest font-bold">{{ market.ticker }}</span>
          <span class="text-gray-500 text-xs hidden md:block">
            {{ market.baseToken.name }}
          </span>
          <span class="text-gray-500 text-xs sm:hidden tracking-wide mt-1">
            {{ $t('markets.vol') }} {{ abbreviatedVolumeInUsdToFormat }} USD
          </span>

          <v-powered-by v-if="isBaycWeth" class="mt-1.5" />
        </div>
      </nuxt-link>
    </span>

    <!-- Mobile column -->
    <div class="sm:hidden flex flex-col items-end">
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

    <span class="hidden font-mono sm:flex items-center justify-end col-span-2">
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
    </span>

    <span class="hidden sm:block font-mono text-right col-span-2">
      <span
        v-if="!change.isNaN()"
        :class="change.gte(0) ? 'text-aqua-500' : 'text-red-500'"
      >
        {{ changeToFormat }}%
      </span>
      <span v-else class="text-gray-400">&mdash;</span>
    </span>

    <span class="hidden sm:block font-mono col-span-3">
      <div v-if="!quoteVolume.isNaN()" class="flex flex-col items-end">
        <span>{{ volumeInUsdToFormat }} USD</span>
        <span class="text-xs text-gray-500">
          {{ quoteVolumeToFormat }}
          <span>
            {{ market.quoteToken.symbol }}
          </span>
        </span>
      </div>
      <span v-else class="text-gray-400">&mdash;</span>
    </span>

    <span class="hidden 3md:flex col-span-2 items-center justify-end">
      <nuxt-link
        class="text-primary-500 hover:text-primary-600"
        :to="marketRoute"
      >
        {{ $t('trade.trade') }}
      </nuxt-link>

      <div
        class="text-primary-500 w-6 h-6 flex items-center justify-center rounded-full ml-6 cursor-pointer hover:bg-primary-500 hover:bg-opacity-10"
        @click="updateWatchList"
      >
        <v-icon-star v-if="isFavourite" class="min-w-5 w-5 h-5" />
        <v-icon-star-border v-else class="min-w-5 w-5 h-5" />
      </div>
    </span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  ZERO_IN_BASE,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import {
  BAYC_WETH_PERP_SLUG,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import VPoweredBy from '~/components/partials/markets/powered-by.vue'
import { Change, MarketRoute } from '~/types'
import { betaMarketSlugs } from '~/app/data/market'
import { getAbbreviatedVolume, getMarketRoute } from '~/app/utils/market'

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
    accountFavouriteMarkets(): string[] {
      return this.$accessor.app.accountFavouriteMarkets
    },

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
        market?.priceDecimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS
      )
    },

    isMarketBeta(): boolean {
      const { market } = this

      if (!market || !market.slug) {
        return false
      }

      return betaMarketSlugs.includes(market.slug)
    },

    quoteVolume(): BigNumberInBase {
      const { summary } = this

      if (!summary || !summary.volume) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.volume)
    },

    quoteVolumeToFormat(): string {
      const { quoteVolume } = this

      return quoteVolume.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
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

      return marketRoute || { name: 'index' }
    },

    isBaycWeth(): boolean {
      const { market } = this

      if (!market || !market.slug) {
        return false
      }

      return market.slug === BAYC_WETH_PERP_SLUG
    },

    isFavourite(): boolean {
      const { accountFavouriteMarkets, market } = this

      return accountFavouriteMarkets.includes(market.marketId)
    }
  },

  methods: {
    updateWatchList() {
      const { market } = this

      this.$accessor.app.updateAccountFavouriteMarkets(market.marketId)
    }
  }
})
</script>
