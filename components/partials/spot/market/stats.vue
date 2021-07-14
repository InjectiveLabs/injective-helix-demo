<template>
  <div v-if="market" class="flex flex-wrap justify-start -mx-2">
    <v-market-info :title="$t('last_traded_price')">
      <v-ui-text sm class="flex items-center justify-end w-full">
        <v-ui-format-order-price
          v-bind="{
            value: lastPrice,
            class: {
              'text-primary-500': lastPriceChange === Change.Increase,
              'text-accent-500': lastPriceChange === Change.Decrease
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
            class: change.gte(0) ? 'text-primary-500' : 'text-accent-500'
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
</template>

<script lang="ts">
import Vue from 'vue'
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
  UiSpotTrade,
  UiSpotMarketSummary
} from '~/types'

export default Vue.extend({
  components: {
    'v-market-info': MarketInfo
  },

  data() {
    return {
      Change,
      SpotOrderSide
    }
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    marketSummary(): UiSpotMarketSummary | undefined {
      return this.$accessor.spot.marketSummary
    },

    trades(): UiSpotTrade[] {
      return this.$accessor.spot.trades
    },

    lastPrice(): BigNumberInBase {
      return this.$accessor.spot.lastTradedPrice
    },

    lastPriceChange(): Change {
      return this.$accessor.spot.lastTradedPriceChange
    },

    high(): BigNumberInBase {
      const { market, marketSummary } = this

      if (!market || !marketSummary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(marketSummary.high)
    },

    change(): BigNumberInBase {
      const { market, marketSummary } = this

      if (!market || !marketSummary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(marketSummary.change)
    },

    low(): BigNumberInBase {
      const { market, marketSummary } = this

      if (!market || !marketSummary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(marketSummary.low)
    },

    volume(): BigNumberInBase {
      const { market, marketSummary } = this

      if (!market || !marketSummary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(marketSummary.volume)
    },

    lastTradedPriceToString(): string {
      const { lastPrice } = this

      if (lastPrice.isNaN() || lastPrice.lte(0)) {
        return `0.00`
      }

      return `${lastPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)}`
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
