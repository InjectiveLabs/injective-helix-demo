<template>
  <nuxt-link :to="marketRoute">
    <TableRow lg>
      <span class="text-base md:text-sm col-span-2 md:col-span-3">
        <div class="flex items-center justify-start">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="w-4 h-4 md:w-6 md:h-6 mr-4"
          />
          <div class="mr-4 text-left">
            <div class="flex">
              {{ market.ticker }}
              <span
                v-if="isMarketBeta"
                primary
                xs
                class="ml-2 text-2xs uppercase text-primary-500"
              >
                {{ $t('marketBeta.beta') }}
              </span>
            </div>
            <span class="text-gray-500 text-xs hidden md:block">
              {{ market.baseToken.name }}
            </span>
          </div>
        </div>
      </span>
      <span
        class="col-span-1 text-2xs md:text-sm text-gray-300 text-left md:hidden"
      >
        {{ $t('trade.last_traded_price') }}
      </span>
      <span
        class="font-mono text-right text-2xs md:text-sm flex items-center justify-end col-span-1 md:col-span-3"
      >
        <IconArrow
          v-if="!lastTradedPrice.isNaN()"
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
          <span class="text-xs text-gray-500 ml-1">
            {{ market.quoteToken.symbol }}
          </span>
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </span>
      <span
        class="col-span-1 text-2xs md:text-sm text-gray-300 text-left md:hidden"
      >
        {{ $t('trade.market_change_24h') }}
      </span>
      <span
        class="font-mono text-right text-2xs md:text-sm col-span-1 md:col-span-3"
      >
        <span
          v-if="!change.isNaN()"
          :class="change.gte(0) ? 'text-aqua-500' : 'text-red-500'"
        >
          {{ changeToFormat }}%
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </span>
      <span
        class="col-span-1 text-2xs md:text-sm text-gray-300 text-left md:hidden"
      >
        {{ $t('trade.market_volume_24h') }}
      </span>
      <span
        class="text-2xs md:text-sm font-mono text-right col-span-1 md:col-span-3"
      >
        <span v-if="!volume.isNaN()">
          {{ volumeToFormat }}
          <span class="text-xs text-gray-500 ml-1">
            {{ market.quoteToken.symbol }}
          </span>
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </span>
    </TableRow>
  </nuxt-link>
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
import TableRow from '~/components/elements/table-row.vue'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { Change, MarketRoute } from '~/types'
import { betaMarketSlugs } from '~/app/data/market'
import { getMarketRoute } from '~/app/utils/market'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    condensed: {
      required: false,
      default: false,
      type: Boolean
    },

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
      Change
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
