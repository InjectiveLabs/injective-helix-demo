<template>
  <div v-if="market">
    <div
      class="grid grid-cols-2 md:grid-cols-3 gap-2.5 lg:gap-0 lg:flex overflow-x-auto overflow-y-none text-xs"
    >
      <MarketInfo
        v-if="market.type === MarketType.Derivative"
        :title="$t('trade.mark_price')"
        :tooltip="$t('trade.mark_price_tooltip')"
      >
        <span v-if="!markPrice.isNaN()" class="lg:text-right font-mono block">
          {{ markPriceToFormat }}
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </MarketInfo>
      <MarketInfo
        :title="$t('trade.volume_asset', { asset: market.quoteToken.symbol })"
        :tooltip="$t('trade.market_volume_24h_tooltip')"
      >
        <span
          v-if="volume.gt(0) && !volume.isNaN()"
          class="lg:text-right font-mono block"
        >
          {{ volumeToFormat }}
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </MarketInfo>
      <MarketInfo :title="$t('trade.high')">
        <span class="lg:text-right font-mono block">
          <span v-if="high.gt(0) && !high.isNaN()">{{ highToFormat }}</span>
          <span v-else class="text-gray-400">&mdash;</span>
        </span>
      </MarketInfo>
      <MarketInfo :title="$t('trade.low')">
        <span class="lg:text-right font-mono block">
          <span v-if="low.gt(0) && !low.isNaN()">{{ lowToFormat }}</span>
          <span v-else class="text-gray-400">&mdash;</span>
        </span>
      </MarketInfo>
      <MarketInfo
        v-if="
          market.type === MarketType.Derivative &&
          market.subType !== MarketType.BinaryOptions
        "
        :title="$t('trade.est_funding_rate')"
        :tooltip="$t('trade.funding_rate_tooltip')"
      >
        <span v-if="!fundingRate.isNaN()" class="lg:text-right font-mono block">
          <span
            :class="{
              'text-aqua-500': fundingRate.gte(0),
              'text-red-500': fundingRate.lt(0)
            }"
          >
            {{
              (fundingRate.gt(0) ? '+' : '') +
              fundingRate.toFormat(5, BIG_NUMBER_ROUND_DOWN_MODE)
            }}%
          </span>
        </span>
        <span v-else class="lg:text-right font-mono block">&mdash;</span>
      </MarketInfo>
      <MarketNextFunding v-if="market.subType === MarketType.Perpetual" />
      <MarketSettlement v-if="market.subType === MarketType.BinaryOptions" />
      <MarketInfo
        v-if="market.subType === MarketType.Futures && expiryAt"
        :title="$t('trade.expiry_date')"
      >
        <span class="lg:text-right font-mono block">
          {{ expiryAt }}
        </span>
      </MarketInfo>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { fromUnixTime, formatDistanceToNow } from 'date-fns'
import {
  UiSpotMarketSummary,
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiExpiryFuturesMarketWithToken,
  UiPerpetualMarketWithToken,
  Change,
  MarketType,
  ZERO_IN_BASE,
  BIG_NUMBER_ROUND_DOWN_MODE,
  SpotOrderSide
} from '@injectivelabs/sdk-ui-ts'
import MarketNextFunding from './next-funding.vue'
import MarketSettlement from './settlement.vue'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import MarketInfo from '~/components/elements/market-info.vue'

export default Vue.extend({
  components: {
    MarketInfo,
    MarketNextFunding,
    MarketSettlement
  },

  props: {
    market: {
      type: Object as PropType<UiDerivativeMarketWithToken>,
      required: true
    },

    summary: {
      type: Object as PropType<UiSpotMarketSummary | UiDerivativeMarketSummary>,
      required: true
    }
  },

  data() {
    return {
      BIG_NUMBER_ROUND_DOWN_MODE,
      Change,
      MarketType,
      SpotOrderSide
    }
  },

  computed: {
    derivativeMarkPrice(): string {
      return this.$accessor.derivatives.marketMarkPrice
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

    tWapEst(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (market.type === MarketType.Spot) {
        return ZERO_IN_BASE
      }

      if (market.subType === MarketType.BinaryOptions) {
        return ZERO_IN_BASE
      }

      if (market.subType === MarketType.Futures) {
        return ZERO_IN_BASE
      }

      const derivativeMarket = market as UiPerpetualMarketWithToken

      if (
        !derivativeMarket.perpetualMarketFunding ||
        !derivativeMarket.isPerpetual
      ) {
        return ZERO_IN_BASE
      }

      const currentUnixTime = Date.now() / 1000
      const divisor = new BigNumberInBase(currentUnixTime).mod(3600).times(24)

      if (divisor.lte(0)) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        derivativeMarket.perpetualMarketFunding.cumulativePrice
      ).dividedBy(divisor)
    },

    fundingRate(): BigNumberInBase {
      const { market, tWapEst } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (market.type === MarketType.Spot) {
        return ZERO_IN_BASE
      }

      if (market.subType === MarketType.BinaryOptions) {
        return ZERO_IN_BASE
      }

      if (market.subType === MarketType.Futures) {
        return ZERO_IN_BASE
      }

      const derivativeMarket = market as UiPerpetualMarketWithToken

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
      ).plus(tWapEst)

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

      return formatDistanceToNow(
        fromUnixTime(expiryFuturesMarketInfo.expirationTimestamp),
        {
          addSuffix: true
        }
      )
    }
  }
})
</script>
