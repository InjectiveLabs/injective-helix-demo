<template>
  <div
    class="grid grid-cols-3 text-gray-200 gap-4 text-xs px-3 py-2 bg-gray-900 items-center hover:bg-gray-850"
    :data-cy="`markets-table-row-${market.ticker}`"
  >
    <span class="col-span-2 text-gray-500 flex items-center">
      <div
        class="text-gray-500 w-6 h-6 flex items-center justify-center rounded-full mr-3 hover:bg-gray-400 hover:text-gray-400 hover:bg-opacity-10 cursor-pointer"
        data-cy="markets-favorite-button"
        @click="updateWatchList"
      >
        <IconStar
          v-if="isFavorite"
          class="min-w-5 w-5 h-5"
          data-cy="markets-is-favorite-icon"
        />
        <IconStarBorder v-else class="min-w-5 w-5 h-5" />
      </div>

      <nuxt-link
        class="cursor-pointer justify-start"
        :to="marketRoute"
        data-cy="markets-trade-link"
      >
        <div class="flex flex-col">
          <span
            class="font-semibold text-gray-200"
            data-cy="markets-ticker-table-data"
          >
            {{ market.ticker }}
          </span>
          <span
            class="text-gray-500 tracking-wide mt-1 font-mono"
            data-cy="markets-volume_24h-table-data"
          >
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
} from '@injectivelabs/sdk-ui-ts'
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
    favoriteMarkets(): string[] {
      return this.$accessor.app.favoriteMarkets
    },

    volumeInUsdToFormat(): string {
      const { volumeInUsd } = this

      return volumeInUsd.toFormat(2, BigNumberInBase.ROUND_DOWN)
    },

    abbreviatedVolumeInUsdToFormat(): string {
      const { volumeInUsd } = this

      return getAbbreviatedVolume(volumeInUsd)
    },

    marketRoute(): MarketRoute {
      const { market } = this

      const marketRoute = getMarketRoute(market)

      return marketRoute || { name: 'markets' }
    },

    isFavorite(): boolean {
      const { favoriteMarkets, market } = this

      return favoriteMarkets.includes(market.marketId)
    }
  },

  methods: {
    updateWatchList() {
      const { market } = this

      this.$accessor.app.updateFavoriteMarkets(market.marketId)
    }
  }
})
</script>
