<template>
  <div v-if="market">
    <div class="flex overflow-x-auto overflow-y-none">
      <v-market-info
        :title="$t('last_traded_price')"
        :tooltip="$t('last_traded_price_tooltip')"
      >
        <span class="text-sm text-right font-mono block">
          <span
            :class="{
              'text-aqua-500': currentLastTradeChange === Change.Increase,
              'text-red-500': currentLastTradeChange === Change.Decrease
            }"
          >
            {{ currentLastTradePriceToFormat }}
          </span>
        </span>
      </v-market-info>
      <v-market-info
        v-if="market.type === MarketType.Derivative"
        :title="$t('mark_price')"
        :tooltip="$t('mark_price_tooltip')"
      >
        <span class="text-sm text-right font-mono block">
          <span
            :class="{
              'text-aqua-500': currentLastTradeChange === Change.Increase,
              'text-red-500': currentLastTradeChange === Change.Decrease
            }"
          >
            {{ markPriceToFormat }}
          </span>
        </span>
      </v-market-info>
      <v-market-info
        :title="$t('market_change_24h')"
        :tooltip="$t('market_change_24h_tooltip')"
      >
        <span class="text-sm text-right font-mono block">
          <span
            :class="{
              'text-aqua-500': change.gte(0),
              'text-red-500': change.lt(0)
            }"
          >
            {{ (change.gt(0) ? '+' : '') + change.toFormat(2) }}%
          </span>
        </span>
      </v-market-info>
      <v-market-info
        :title="$t('volume_asset', { asset: market.quoteToken.symbol })"
        :tooltip="$t('market_volume_24h_tooltip')"
      >
        <span class="text-sm text-right font-mono block">
          {{ volumeToFormat }}
        </span>
      </v-market-info>
      <v-market-info :title="$t('high')">
        <span class="text-sm text-right font-mono block">
          <span v-if="high.gt(0)">{{ highToFormat }}</span>
          <span v-else class="text-gray-400">&mdash;</span>
        </span>
      </v-market-info>
      <v-market-info :title="$t('low')">
        <span class="text-sm text-right font-mono block">
          <span v-if="low.gt(0)">{{ lowToFormat }}</span>
          <span v-else class="text-gray-400">&mdash;</span>
        </span>
      </v-market-info>
      <v-market-info
        v-if="market.type === MarketType.Derivative"
        :title="$t('est_funding_rate')"
        :tooltip="$t('funding_rate_tooltip')"
      >
        <span
          v-if="fundingRate.gt(0)"
          class="text-sm text-right font-mono block"
        >
          <span
            :class="{
              'text-aqua-500': fundingRate.gte(0),
              'text-red-500': fundingRate.lt(0)
            }"
          >
            {{ (fundingRate.gt(0) ? '+' : '') + fundingRate.toFormat(4) }}%
          </span>
        </span>
        <span v-else class="text-sm text-right font-mono block">&mdash;</span>
      </v-market-info>
      <v-market-next-funding v-if="market.type === MarketType.Derivative" />
      <v-market-info
        v-if="market.type === MarketType.Derivative && expiryAt"
        :title="$t('expiry_date')"
      >
        <span class="text-sm text-right font-mono block">
          {{ expiryAt }}
        </span>
      </v-market-info>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { fromUnixTime, formatDistanceToNow } from 'date-fns'
import MarketNextFunding from './next-funding.vue'
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
    'v-market-info': MarketInfo,
    'v-market-next-funding': MarketNextFunding
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
      MarketType,
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

    derivativeMarkPrice(): string {
      return this.$accessor.derivatives.marketMarkPrice
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

    markPrice(): BigNumberInBase {
      const { derivativeMarkPrice, market } = this

      if (!derivativeMarkPrice) {
        return ZERO_IN_BASE
      }

      if (market.type === MarketType.Spot) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(derivativeMarkPrice)
    },

    markPriceToFormat(): string {
      const { market, markPrice } = this

      if (!market) {
        return markPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return markPrice.toFormat(market.priceDecimals)
    },

    currentLastTradePriceToFormat(): string {
      const { market, currentLastTrade } = this

      if (!market) {
        return currentLastTrade.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return currentLastTrade.toFormat(market.priceDecimals)
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

    highToFormat(): string {
      const { market, high } = this

      if (!market) {
        return high.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return high.toFormat(market.priceDecimals)
    },

    twapEst(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (market.type === MarketType.Spot) {
        return ZERO_IN_BASE
      }

      const derivativeMarket = market as UiDerivativeMarket

      if (
        !derivativeMarket.perpetualMarketFunding ||
        !derivativeMarket.isPerpetual
      ) {
        return ZERO_IN_BASE
      }

      const currentUnixTime = Date.now() / 1000

      return new BigNumberInBase(
        derivativeMarket.perpetualMarketFunding.cumulativePrice
      ).dividedBy(new BigNumberInBase(currentUnixTime).mod(3600).times(24))
    },

    fundingRate(): BigNumberInBase {
      const { market, twapEst } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (market.type === MarketType.Spot) {
        return ZERO_IN_BASE
      }

      const derivativeMarket = market as UiDerivativeMarket

      if (
        !derivativeMarket.perpetualMarketFunding ||
        !derivativeMarket.isPerpetual ||
        !derivativeMarket.perpetualMarketInfo
      ) {
        return ZERO_IN_BASE
      }

      const hourlyFundingRateCap = new BigNumberInBase(
        derivativeMarket.perpetualMarketInfo.hourlyFundingRateCap
      )
      const estFundingRate = new BigNumberInBase(
        derivativeMarket.perpetualMarketInfo.hourlyInterestRate
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

    lowToFormat(): string {
      const { market, low } = this

      if (!market) {
        return low.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return low.toFormat(market.priceDecimals)
    },

    volume(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.volume)
    },

    volumeToFormat(): string {
      const { market, volume } = this

      if (!market) {
        return volume.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return volume.toFormat(market.priceDecimals)
    },

    expiryAt(): string {
      const { market } = this

      if (!market || market.type === MarketType.Spot) {
        return ''
      }

      const expiryFuturesMarketInfo = (market as UiDerivativeMarket)
        .expiryFuturesMarketInfo

      if (!expiryFuturesMarketInfo) {
        return ''
      }

      if (!expiryFuturesMarketInfo.expirationTimestamp) {
        return ''
      }

      return formatDistanceToNow(
        fromUnixTime(expiryFuturesMarketInfo.expirationTimestamp),
        {
          addSuffix: true
        }
      )
    },

    lastTradedPriceToString(): string {
      const { currentLastTrade } = this

      if (currentLastTrade.isNaN() || currentLastTrade.lte(0)) {
        return '0.00'
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
