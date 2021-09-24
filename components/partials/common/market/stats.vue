<template>
  <div v-if="market" class="h-10 bg-dark-900">
    <div class="flex overflow-x-auto overflow-y-none">
      <v-market-info :title="$t('last_traded_price')">
        <v-ui-text sm class="flex items-center justify-end w-full">
          <v-ui-format-order-price
            v-bind="{
              value: currentLastTrade,
              class: {
                'text-aqua-500': currentLastTradeChange === Change.Increase,
                'text-red-500': currentLastTradeChange === Change.Decrease
              },
              decimals: market.priceDecimals
            }"
          />
        </v-ui-text>
      </v-market-info>
      <v-market-info :title="$t('market_change_24h')" class="">
        <v-ui-text sm class="flex items-center justify-end w-full">
          <v-ui-format-percent
            v-bind="{
              appendPlusSign: true,
              precision: 2,
              value: change.toString(),
              class: change.gte(0) ? 'text-aqua-500' : 'text-red-500'
            }"
          />
        </v-ui-text>
      </v-market-info>
      <v-market-info
        :title="$t('volume_asset', { asset: market.quoteToken.symbol })"
      >
        <v-ui-text sm class="flex items-center justify-end w-full">
          <v-ui-format-price
            v-bind="{
              dontGroupValues: true,
              value: volume
            }"
          />
        </v-ui-text>
      </v-market-info>
      <v-market-info :title="$t('high')">
        <v-ui-text sm class="flex items-center justify-end w-full">
          <v-ui-format-price
            v-if="high.gt(0)"
            v-bind="{
              value: high
            }"
          />
          <span v-else class="text-gray-500">&mdash;</span>
        </v-ui-text>
      </v-market-info>
      <v-market-info :title="$t('low')">
        <v-ui-text sm class="flex items-center justify-end w-full">
          <v-ui-format-price
            v-if="high.gt(0)"
            v-bind="{
              value: low
            }"
          />
          <span v-else class="text-gray-500">&mdash;</span>
        </v-ui-text>
      </v-market-info>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import { headTitle } from '~/app/utils/generators'
import MarketInfo from '~/components/elements/market-info.vue'
import {
  Change,
  UiSpotMarket,
  SpotOrderSide,
  UiSpotMarketSummary,
  UiDerivativeMarket,
  UiDerivativeMarketSummary,
  MarketType
} from '~/types'

export default Vue.extend({
  components: {
    'v-market-info': MarketInfo
  },

  props: {
    market: {
      type: Object as PropType<UiSpotMarket | UiDerivativeMarket>,
      required: true
    },

    summary: {
      type: Object as PropType<UiSpotMarketSummary | UiDerivativeMarketSummary>,
      required: true
    }
  },

  data() {
    return {
      Change,
      SpotOrderSide
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

    currentLastSpotTradedPriceChange(): Change {
      return this.$accessor.spot.lastTradedPriceChange
    },

    currentLastDerivativeTradedPriceChange(): Change {
      return this.$accessor.derivatives.lastTradedPriceChange
    },

    currentMarket(): UiSpotMarket | UiDerivativeMarket | undefined {
      const { currentSpotMarket, currentDerivativeMarket, market } = this

      return market.type === MarketType.Spot
        ? currentSpotMarket
        : currentDerivativeMarket
    },

    currentLastTrade(): BigNumberInBase {
      const {
        currentLastSpotTradedPrice,
        currentLastDerivativeTradedPrice,
        market
      } = this

      return market.type === MarketType.Spot
        ? currentLastSpotTradedPrice
        : currentLastDerivativeTradedPrice
    },

    currentLastTradeChange(): Change {
      const {
        currentLastSpotTradedPriceChange,
        currentLastDerivativeTradedPriceChange,
        market
      } = this

      return market.type === MarketType.Spot
        ? currentLastSpotTradedPriceChange
        : currentLastDerivativeTradedPriceChange
    },

    high(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.high)
    },

    change(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.change)
    },

    low(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.low)
    },

    volume(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.volume)
    },

    lastTradedPriceToString(): string {
      const { currentLastTrade } = this

      if (currentLastTrade.isNaN() || currentLastTrade.lte(0)) {
        return `0.00`
      }

      return `${currentLastTrade.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)}`
    }
  },

  watch: {
    lastTradedPriceToString(newPrice: string) {
      const { market } = this

      if (market) {
        document.title = `${newPrice} - ${market.ticker} | ${headTitle}`
      }
    }
  },

  beforeDestroy() {
    document.title = headTitle
  }
})
</script>
