<template>
  <TableRow>
    <span class="col-span-3 text-right xl:text-left">
      <div
        class="flex items-center mb-2 xl:mb-0 cursor-pointer"
        @click.stop="handleClickOnMarket"
      >
        <img
          :src="market.baseToken.icon"
          :alt="market.baseToken.name"
          class="w-6 h-6 mr-4"
        />
        <div class="mr-4">
          {{ market.ticker }}
          <span
            class="text-gray-400 dark:text-gray-500 text-xs xl:text-xs 2xl:text-sm block"
          >
            {{ market.baseToken.name }}
          </span>
        </div>
      </div>
    </span>
    <span class="col-span-3 font-mono text-right flex items-center justify-end">
      <v-icon-arrow
        class="transform rotate-90 w-3 h-3 mr-1"
        :class="{
          'text-aqua-500': lastPriceChange === Change.Increase,
          'text-red-500': lastPriceChange === Change.Decrease
        }"
      />
      <span
        :class="{
          'text-aqua-500': lastPriceChange === Change.Increase,
          'text-red-500': lastPriceChange === Change.Decrease
        }"
      >
        {{ lastTradedPriceToFormat }}
        <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">{{
          market.quoteToken.symbol
        }}</span>
      </span>
    </span>
    <span class="col-span-3 font-mono text-right">
      <span :class="change.gte(0) ? 'text-aqua-500' : 'text-red-500'">
        {{ changeToFormat }}%
      </span>
    </span>
    <span class="col-span-3 font-mono text-right">
      {{ volumeToFormat }}
      <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">{{
        market.quoteToken.symbol
      }}</span>
    </span>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import TableRow from '~/components/partials/common/elements/table-row.vue'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import {
  Change,
  MarketType,
  UiDerivativeMarket,
  UiDerivativeMarketSummary,
  UiSpotMarket,
  UiSpotMarketSummary
} from '~/types'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    market: {
      required: true,
      type: Object as PropType<UiDerivativeMarket | UiSpotMarket>
    },

    summary: {
      required: true,
      type: Object as PropType<UiDerivativeMarketSummary | UiSpotMarketSummary>
    },

    type: {
      required: true,
      type: String as PropType<MarketType>
    }
  },

  data() {
    return {
      Change
    }
  },

  computed: {
    currentSpotMarket(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    currentDerivativeMarket(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    currentLastSpotTradedPrice(): BigNumberInBase {
      return this.$accessor.spot.lastTradedPrice
    },

    currentLastDerivativeTradedPrice(): BigNumberInBase {
      return this.$accessor.derivatives.lastTradedPrice
    },

    currentMarket(): UiSpotMarket | UiDerivativeMarket | undefined {
      const { currentSpotMarket, currentDerivativeMarket, type } = this

      return type === MarketType.Spot
        ? currentSpotMarket
        : currentDerivativeMarket
    },

    currentLastTradedPrice(): BigNumberInBase {
      const {
        currentLastSpotTradedPrice,
        currentLastDerivativeTradedPrice,
        type
      } = this

      return type === MarketType.Spot
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
        return lastTradedPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return lastTradedPrice.toFormat(market.priceDecimals)
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

      return volume.toFormat(0)
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

      return change.toFormat(2)
    },

    lastPriceChange(): Change {
      const { market, summary } = this

      if (!market || !summary) {
        return Change.NoChange
      }

      if (!summary.lastPrice) {
        return Change.NoChange
      }

      return new BigNumberInBase(summary.price).gte(summary.lastPrice)
        ? Change.Increase
        : Change.Decrease
    }
  },

  methods: {
    handleClickOnMarket() {
      const { market, type } = this

      if (type === MarketType.Derivative) {
        return this.$router.push({
          name: 'derivatives-derivative',
          params: {
            marketId: market.marketId,
            derivative: market.slug
          }
        })
      }

      if (type === MarketType.Spot) {
        return this.$router.push({
          name: 'spot-spot',
          params: {
            marketId: market.marketId,
            spot: market.slug
          }
        })
      }
    }
  }
})
</script>
