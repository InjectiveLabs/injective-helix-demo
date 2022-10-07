<template>
  <div
    class="grid grid-cols-3 sm:grid-cols-10 3md:grid-cols-12 text-gray-200 gap-4 text-sm px-4 py-5 mb-1 items-center"
    :data-cy="`markets-table-row-${market.ticker}`"
  >
    <span class="text-sm col-span-2 sm:col-span-3 flex items-center">
      <div
        class="3md:hidden text-primary-500 mr-3 cursor-pointer"
        data-cy="markets-favourite-button"
        @click="updateWatchList"
      >
        <IconStar v-if="isFavorite" class="min-w-6 w-6 h-6" />
        <IconStarBorder v-else class="min-w-6 w-6 h-6" />
      </div>

      <nuxt-link :to="marketRoute">
        <div
          class="cursor-pointer flex items-center"
          @click="handleTradeClickedTrack"
        >
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="w-6 h-6 mr-3 hidden 3md:block"
          />
          <div class="flex flex-col">
            <span
              class="tracking-wider font-bold mb-1"
              data-cy="markets-ticker-name-table-data"
              >{{ market.ticker }}
            </span>
            <span class="text-gray-500 text-xs hidden md:block">
              {{ market.baseToken.name }}
            </span>
            <span class="text-gray-500 text-xs sm:hidden tracking-wide mt-1">
              {{ $t('markets.vol') }} {{ abbreviatedVolumeInUsdToFormat }} USD
            </span>
          </div>
        </div>
      </nuxt-link>
    </span>

    <!-- Mobile column -->
    <div class="sm:hidden flex flex-col items-end font-mono">
      <div class="flex items-center">
        <span
          v-if="!lastTradedPrice.isNaN()"
          class=""
          :class="{
            'text-green-500': lastPriceChange === Change.Increase,
            'text-white': lastPriceChange === Change.NoChange,
            'text-red-500': lastPriceChange === Change.Decrease
          }"
        >
          {{ lastTradedPriceToFormat }}
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </div>

      <div v-if="!change.isNaN()" class="mt-1">
        <span :class="change.gte(0) ? 'text-green-500' : 'text-red-500'">
          {{ changeToFormat }}%
        </span>
      </div>
    </div>

    <span
      class="hidden font-mono sm:flex items-center justify-end col-span-2"
      data-cy="markets-last-traded-price-table-data"
    >
      <span
        v-if="!lastTradedPrice.isNaN()"
        :class="{
          'text-green-500': lastPriceChange === Change.Increase,
          'text-white': lastPriceChange === Change.NoChange,
          'text-red-500': lastPriceChange === Change.Decrease
        }"
      >
        {{ lastTradedPriceToFormat }}
      </span>
      <span v-else class="text-gray-400">&mdash;</span>
    </span>

    <span class="hidden sm:block font-mono text-right col-span-2 text-sm">
      <span
        v-if="!change.isNaN()"
        data-cy="markets-change_24h-table-data"
        :class="{
          'text-green-500': change.gt(0),
          'text-white': change.eq(0),
          'text-red-500': change.lt(0)
        }"
      >
        {{ changeToFormat }}%
      </span>
      <span v-else class="text-gray-400">&mdash;</span>
    </span>

    <span class="hidden sm:block font-mono col-span-3">
      <div v-if="!quoteVolume.isNaN()" class="flex flex-col items-end">
        <span data-cy="markets-volume-usd-table-data" class="mb-1">
          {{ volumeInUsdToFormat }} USD
        </span>
        <span
          class="text-xs text-gray-500"
          data-cy="markets-volume-quote-asset-table-data"
        >
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
        data-cy="markets-trade-link"
        :to="marketRoute"
      >
        <div @click="handleTradeClickedTrack">
          {{ $t('trade.trade') }}
        </div>
      </nuxt-link>

      <div
        class="text-primary-500 w-6 h-6 flex items-center justify-center rounded-full ml-6 cursor-pointer hover:bg-primary-500 hover:bg-opacity-10"
        data-cy="markets-favorite-button"
        @click="updateWatchList"
      >
        <IconStar
          v-if="isFavorite"
          class="min-w-5 w-5 h-5"
          data-cy="markets-is-favorite-icon"
        />
        <IconStarBorder
          v-else
          class="min-w-5 w-5 h-5"
          data-cy="markets-is-not-favorite-icon"
        />
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
  UiSpotMarketWithToken,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { Change, MarketRoute, TradeClickOrigin } from '~/types'
import { betaMarketSlugs } from '~/app/data/market'
import { getAbbreviatedVolume, getMarketRoute } from '~/app/utils/market'
import { amplitudeTracker } from '~/app/providers/AmplitudeTracker'

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
    favoriteMarkets(): string[] {
      return this.$accessor.app.favoriteMarkets
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
        market?.priceDecimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
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

      return quoteVolume.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    volumeInUsdToFormat(): string {
      const { volumeInUsd } = this

      return volumeInUsd.toFormat(2, BigNumberInBase.ROUND_DOWN)
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

    isFavorite(): boolean {
      const { favoriteMarkets, market } = this

      return favoriteMarkets.includes(market.marketId)
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
  },

  methods: {
    updateWatchList() {
      const { market } = this

      this.$accessor.app.updateFavoriteMarkets(market.marketId)
    },

    handleTradeClickedTrack() {
      amplitudeTracker.submitTradeClickedTrackEvent({
        market: this.market.slug,
        marketType: this.market.subType,
        origin: TradeClickOrigin.MarketsPage
      })
    }
  }
})
</script>
