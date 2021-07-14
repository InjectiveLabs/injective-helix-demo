<template>
  <div v-if="market" class="flex flex-wrap justify-start -mx-2">
    <v-market-info :title="$t('last_traded_price')">
      <v-ui-text sm class="flex items-center justify-end w-full">
        <v-ui-format-price
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
    <v-market-info :title="$t('mark_price')">
      <v-ui-text sm class="flex items-center justify-end w-full">
        <v-ui-format-price
          v-bind="{
            value: markPriceToBN,
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
            decimals: 0,
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
    <v-market-info
      v-if="market.isPerpetual"
      :title="$t('est_funding_rate')"
      class=""
    >
      <v-ui-icon
        slot="icon"
        :icon="Icon.Info"
        class="text-gray-600 hover:text-gray-300"
        :tooltip="$t('funding_rate_tooltip')"
        2xs
      />
      <v-ui-text sm class="flex items-center justify-end w-full">
        <v-ui-format-percent
          v-bind="{
            appendPlusSign: true,
            precision: 6,
            value: fundingRate.toFixed()
          }"
        />
      </v-ui-text>
    </v-market-info>
    <client-only v-if="market.isPerpetual">
      <v-market-next-funding-countdown />
    </client-only>
    <client-only v-if="!market.isPerpetual">
      <v-market-expiry-countdown />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import NextFunding from './next-funding.vue'
import MarketExpiry from './market-expiry.vue'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import MarketInfo from '~/components/elements/market-info.vue'
import {
  DerivativeOrderSide,
  UiDerivativeMarket,
  UiDerivativeTrade,
  Change,
  Icon,
  UiDerivativeMarketSummary
} from '~/types'
import { headTitle } from '~/app/utils/generators'

export default Vue.extend({
  components: {
    'v-market-info': MarketInfo,
    'v-market-expiry-countdown': MarketExpiry,
    'v-market-next-funding-countdown': NextFunding
  },

  data() {
    return {
      DerivativeOrderSide,
      Change,
      Icon
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    marketSummary(): UiDerivativeMarketSummary | undefined {
      return this.$accessor.derivatives.marketSummary
    },

    trades(): UiDerivativeTrade[] {
      return this.$accessor.derivatives.trades
    },

    markPrice(): string {
      return this.$accessor.derivatives.marketMarkPrice
    },

    lastPrice(): BigNumberInBase {
      return this.$accessor.derivatives.lastTradedPrice
    },

    lastPriceChange(): Change {
      return this.$accessor.derivatives.lastTradedPriceChange
    },

    markPriceToBN(): BigNumberInBase {
      const { markPrice } = this

      if (!markPrice) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(markPrice)
    },

    change(): BigNumberInBase {
      const { market, marketSummary } = this

      if (!market || !marketSummary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(marketSummary.change)
    },

    high(): BigNumberInBase {
      const { market, marketSummary } = this

      if (!market || !marketSummary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(marketSummary.high)
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

      return new BigNumberInBase(
        new BigNumberInBase(marketSummary.volume).dp(0).toFixed()
      )
    },

    twapEst(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!market.perpetualMarketFunding || !market.isPerpetual) {
        return ZERO_IN_BASE
      }

      const currentUnixTime = Date.now() / 1000

      return new BigNumberInBase(
        market.perpetualMarketFunding.cumulativePrice
      ).dividedBy(new BigNumberInBase(currentUnixTime).mod(3600).times(24))
    },

    fundingRate(): BigNumberInBase {
      const { market, twapEst } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (
        !market.perpetualMarketFunding ||
        !market.isPerpetual ||
        !market.perpetualMarketInfo
      ) {
        return ZERO_IN_BASE
      }

      const hourlyFundingRateCap = new BigNumberInBase(
        market.perpetualMarketInfo.hourlyFundingRateCap
      )
      const estFundingRate = new BigNumberInBase(
        market.perpetualMarketInfo.hourlyInterestRate
      ).plus(twapEst)

      if (estFundingRate.gt(hourlyFundingRateCap)) {
        return new BigNumberInBase(hourlyFundingRateCap).multipliedBy(100)
      }

      if (estFundingRate.lt(hourlyFundingRateCap.times(-1))) {
        return new BigNumberInBase(hourlyFundingRateCap)
          .times(-1)
          .multipliedBy(100)
      }

      return new BigNumberInBase(estFundingRate).multipliedBy(100)
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
