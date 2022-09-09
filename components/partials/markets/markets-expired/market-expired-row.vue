<template>
  <div
    class="grid grid-cols-3 sm:grid-cols-10 3md:grid-cols-12 text-gray-200 gap-4 text-sm px-4 py-2 mb-1 items-center border-b"
    :data-cy="`markets-expired-table-row-${market.ticker}`"
  >
    <span class="text-sm col-span-2 sm:col-span-3 flex items-center">
      <nuxt-link :to="marketRoute">
        <div class="cursor-pointer flex items-center">
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
          </div>
        </div>
      </nuxt-link>
    </span>

    <!-- Mobile column -->
    <div class="sm:hidden flex flex-col items-end font-mono">
      <div class="flex flex-wrap items-center">
        <div class="w-full flex items-center">
          <span v-if="!settlementPrice.isNaN()" class="">
            <span class="font-sans">{{ $t('markets.settledAt') }}</span>
            {{ settlementPriceToFormat }} {{ market.quoteToken.symbol }}
          </span>
          <span v-else class="text-gray-400">&mdash;</span>
        </div>
        <div class="w-full text-gray-500 text-xs">{{ expiryAt }}</div>
      </div>
    </div>

    <span
      class="hidden font-mono sm:flex sm:flex-wrap items-center justify-end col-span-3"
      data-cy="markets-last-traded-price-table-data"
    >
      <div class="w-full flex items-center justify-end">
        <span v-if="!settlementPrice.isNaN()">
          <span class="font-sans">{{ $t('markets.settledAt') }}</span>
          {{ settlementPriceToFormat }} {{ market.quoteToken.symbol }}
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </div>
      <div class="w-full text-gray-500 text-xs text-right">{{ expiryAt }}</div>
    </span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  ZERO_IN_BASE,
  getTokenLogoWithVendorPathPrefix,
  UiExpiryFuturesMarketWithToken,
  MarketType
} from '@injectivelabs/sdk-ui-ts'
import { format, fromUnixTime } from 'date-fns'
import { MarketRoute } from '~/types'
import { getMarketRoute } from '~/app/utils/market'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  props: {
    market: {
      type: Object as PropType<UiExpiryFuturesMarketWithToken>,
      required: true
    }
  },

  computed: {
    settlementPrice(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!market.expiryFuturesMarketInfo) {
        return ZERO_IN_BASE
      }

      if (!market.expiryFuturesMarketInfo.settlementPrice) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(
        market.expiryFuturesMarketInfo.settlementPrice
      ).toBase(market.quoteToken.decimals)
    },

    settlementPriceToFormat(): string {
      const { settlementPrice, market } = this

      return settlementPrice.toFormat(
        market?.priceDecimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
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
    },

    expiryAt(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      if (market.type === MarketType.Spot) {
        return ''
      }

      if (market.subType === MarketType.BinaryOptions) {
        return ''
      }

      if (market.subType === MarketType.Perpetual) {
        return ''
      }

      const derivativeMarket = market as UiExpiryFuturesMarketWithToken
      const expiryFuturesMarketInfo = derivativeMarket.expiryFuturesMarketInfo

      if (!expiryFuturesMarketInfo) {
        return ''
      }

      if (!expiryFuturesMarketInfo.expirationTimestamp) {
        return ''
      }

      return format(
        fromUnixTime(expiryFuturesMarketInfo.expirationTimestamp),
        'dd LLL yyyy, HH:mm:ss'
      )
    }
  }
})
</script>
