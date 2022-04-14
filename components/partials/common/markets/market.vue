<template>
  <TableRow
    :dense="condensed"
    :lg="!condensed"
    @click.native.stop="handleClickOnMarket"
  >
    <span
      class="text-base md:text-sm"
      :class="{
        'col-span-2 md:col-span-3': !condensed,
        'col-span-2 md:col-span-5': condensed
      }"
    >
      <div class="flex items-center cursor-pointer justify-start">
        <img
          :src="market.baseToken.logo"
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
          <span v-if="!condensed" class="text-gray-500 text-xs hidden md:block">
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
      class="font-mono text-right text-2xs md:text-sm flex items-center justify-end"
      :class="{
        'col-span-1 md:col-span-3': !condensed,
        'col-span-1 md:col-span-4': condensed
      }"
    >
      <v-icon-arrow
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
      v-if="!condensed"
      class="col-span-1 text-2xs md:text-sm text-gray-300 text-left md:hidden"
    >
      {{ $t('trade.market_volume_24h') }}
    </span>
    <span
      v-if="!condensed"
      class="text-2xs md:text-sm font-mono text-right"
      :class="{
        'col-span-1 md:col-span-3': !condensed,
        'col-span-4': condensed
      }"
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
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  MarketType,
  ZERO_IN_BASE,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import TableRow from '~/components/elements/table-row.vue'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { Change } from '~/types'
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

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      if (
        currentMarket &&
        currentMarket.marketId === market.marketId &&
        currentLastTradedPrice
      ) {
        return currentLastTradedPrice
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
    }
  },

  methods: {
    handleClickOnMarket() {
      const { market } = this

      this.$root.$emit('close-market-slideout')

      const marketRoute = getMarketRoute(market)

      if (marketRoute) {
        return this.$router.push(marketRoute)
      }
    }
  }
})
</script>
