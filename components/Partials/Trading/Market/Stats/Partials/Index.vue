<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { fromUnixTime, formatDistance, format } from 'date-fns'
import {
  MarketType,
  ZERO_IN_BASE,
  BIG_NUMBER_ROUND_DOWN_MODE,
  UiDerivativeMarketWithToken,
  UiPerpetualMarketWithToken,
  UiExpiryFuturesMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { stableCoinDenoms } from '@/app/data/token'
import { QUOTE_DENOMS_TO_SHOW_USD_VALUE } from '@/app/data/market'
import { UiMarketWithToken, UiMarketSummary } from '@/types'

const tokenStore = useTokenStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  summary: {
    type: Object as PropType<UiMarketSummary>,
    required: true
  }
})

const now = ref(Date.now() / 1000)
const userTimezone = format(new Date(), 'OOOO')

const { markPrice } = useDerivativeLastPrice(computed(() => props.market))
const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)

const {
  valueToString: markPriceToFormat,
  valueToBigNumber: markPriceToBigNumber
} = useBigNumberFormatter(
  computed(() => {
    if (props.market.type === MarketType.Spot) {
      return ZERO_IN_BASE
    }

    return markPrice.value
  }),
  {
    decimalPlaces: props.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: highToFormat, valueToBigNumber: high } =
  useBigNumberFormatter(
    computed(() => {
      if (!props.summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(props.summary.high)
    }),
    {
      decimalPlaces: props.market.priceDecimals
    }
  )

const {
  valueToString: spotLastTradedPriceInUsdToString,
  valueToBigNumber: spotLastTradedPriceInUsdToBigNumber
} = useBigNumberFormatter(
  computed(() =>
    new BigNumberInBase(
      tokenStore.tokenUsdPrice(props.market.quoteToken.coinGeckoId)
    ).times(spotLastTradedPrice.value)
  ),
  {
    decimalPlaces: props.market.priceDecimals,
    minimalDecimalPlaces: props.market.priceDecimals
  }
)

const { valueToBigNumber: tWapEst } = useBigNumberFormatter(
  computed(() => {
    if (props.market.type === MarketType.Spot) {
      return ZERO_IN_BASE
    }

    if (props.market.subType === MarketType.BinaryOptions) {
      return ZERO_IN_BASE
    }

    if (props.market.subType === MarketType.Futures) {
      return ZERO_IN_BASE
    }

    const derivativeMarket = props.market as UiPerpetualMarketWithToken

    if (
      !derivativeMarket.perpetualMarketFunding ||
      !derivativeMarket.isPerpetual
    ) {
      return ZERO_IN_BASE
    }

    const currentUnixTime = Math.floor(Date.now() / 1000)
    const divisor = new BigNumberInBase(currentUnixTime).mod(3600).times(24)

    if (divisor.lte(0)) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(
      derivativeMarket.perpetualMarketFunding.cumulativePrice
    ).dividedBy(divisor)
  })
)

const { valueToBigNumber: fundingRate } = useBigNumberFormatter(
  computed(() => {
    if (props.market.type === MarketType.Spot) {
      return ZERO_IN_BASE
    }

    if (props.market.subType === MarketType.BinaryOptions) {
      return ZERO_IN_BASE
    }

    if (props.market.subType === MarketType.Futures) {
      return ZERO_IN_BASE
    }

    const derivativeMarket = props.market as UiPerpetualMarketWithToken

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
    ).plus(tWapEst.value)

    if (estFundingRate.gt(hourlyFundingRateCap)) {
      return new BigNumberInBase(hourlyFundingRateCap).multipliedBy(100)
    }

    if (estFundingRate.lt(hourlyFundingRateCap.times(-1))) {
      return new BigNumberInBase(hourlyFundingRateCap)
        .times(-1)
        .multipliedBy(100)
    }

    return new BigNumberInBase(estFundingRate).multipliedBy(100)
  })
)

const { valueToString: lowToFormat, valueToBigNumber: low } =
  useBigNumberFormatter(
    computed(() => {
      if (!props.summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(props.summary.low)
    }),
    {
      decimalPlaces: props.market.priceDecimals,
      minimalDecimalPlaces: props.market.priceDecimals
    }
  )

const { valueToString: volumeToFormat, valueToBigNumber: volume } =
  useBigNumberFormatter(
    computed(() => {
      if (!props.summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(props.summary.volume)
    }),
    {
      decimalPlaces: stableCoinDenoms.includes(props.market.quoteToken.symbol)
        ? 0
        : props.market.priceDecimals
    }
  )

const expiryAt = computed(() => {
  if (props.market.type === MarketType.Spot) {
    return ''
  }

  if (props.market.subType === MarketType.BinaryOptions) {
    return ''
  }

  if (props.market.subType === MarketType.Perpetual) {
    return ''
  }

  const derivativeMarket = props.market as UiExpiryFuturesMarketWithToken
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
})

const isExpired = computed(() => {
  if (props.market.type === MarketType.Spot) {
    return true
  }

  if (props.market.subType === MarketType.BinaryOptions) {
    return true
  }

  if (props.market.subType === MarketType.Perpetual) {
    return true
  }

  const derivativeMarket = props.market as UiExpiryFuturesMarketWithToken
  const expiryFuturesMarketInfo = derivativeMarket.expiryFuturesMarketInfo

  if (!expiryFuturesMarketInfo) {
    return true
  }

  if (!expiryFuturesMarketInfo.expirationTimestamp) {
    return true
  }

  return expiryFuturesMarketInfo.expirationTimestamp <= now.value
})

const timeToExpiry = computed(() => {
  if (props.market.type === MarketType.Spot) {
    return ''
  }

  if (props.market.subType === MarketType.BinaryOptions) {
    return ''
  }

  if (props.market.subType === MarketType.Perpetual) {
    return ''
  }

  const derivativeMarket = props.market as UiExpiryFuturesMarketWithToken
  const expiryFuturesMarketInfo = derivativeMarket.expiryFuturesMarketInfo

  if (!expiryFuturesMarketInfo) {
    return ''
  }

  if (!expiryFuturesMarketInfo.expirationTimestamp) {
    return ''
  }

  const nowInMilliseconds = new BigNumberInBase(now.value)
    .times(1000)
    .toNumber()
  const expirationTimestampInMilliseconds = new BigNumberInBase(
    expiryFuturesMarketInfo.expirationTimestamp
  )
    .times(1000)
    .toNumber()

  return formatDistance(nowInMilliseconds, expirationTimestampInMilliseconds)
})

watch(isExpired, (hasExpired) => {
  if (props.market.subType === MarketType.Futures && hasExpired) {
    window.location.reload()
  }
})

useIntervalFn(() => {
  now.value = Date.now() / 1000
}, 5000)
</script>

<template>
  <div>
    <div
      class="grid grid-cols-2 md:grid-cols-3 gap-2.5 lg:gap-0 lg:flex overflow-hidden text-xs"
    >
      <CommonMarketInfo
        v-if="market.type === MarketType.Derivative"
        :title="$t('trade.mark_price')"
        :tooltip="$t('trade.mark_price_tooltip')"
      >
        <span
          v-if="!markPriceToBigNumber.isNaN()"
          class="lg:text-right font-mono block"
          data-cy="market-info-mark-price-span"
        >
          {{ markPriceToFormat }}
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </CommonMarketInfo>

      <CommonMarketInfo
        v-if="QUOTE_DENOMS_TO_SHOW_USD_VALUE.includes(market.quoteToken.denom)"
        :title="$t('trade.usd_value')"
        :tooltip="
          $t('trade.usd_value_tooltip', {
            asset: market.quoteToken.symbol
          })
        "
      >
        <span
          v-if="
            spotLastTradedPriceInUsdToBigNumber.gt(0) &&
            !spotLastTradedPriceInUsdToBigNumber.isNaN()
          "
          class="lg:text-right font-mono block"
          data-cy="market-info-volume-24h-span"
        >
          {{ spotLastTradedPriceInUsdToString }}
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </CommonMarketInfo>
      <CommonMarketInfo
        :title="$t('trade.volume_asset', { asset: market.quoteToken.symbol })"
        :tooltip="$t('trade.market_volume_24h_tooltip')"
      >
        <span
          v-if="volume.gt(0) && !volume.isNaN()"
          class="lg:text-right font-mono block"
          data-cy="market-info-volume-24h-span"
        >
          {{ volumeToFormat }}
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </CommonMarketInfo>
      <CommonMarketInfo :title="$t('trade.high')">
        <span class="lg:text-right font-mono block">
          <span
            v-if="high.gt(0) && !high.isNaN()"
            data-cy="market-info-high-price-24h-span"
          >
            {{ highToFormat }}
          </span>
          <span v-else class="text-gray-400">&mdash;</span>
        </span>
      </CommonMarketInfo>
      <CommonMarketInfo :title="$t('trade.low')">
        <span class="lg:text-right font-mono block">
          <span
            v-if="low.gt(0) && !low.isNaN()"
            data-cy="market-info-low-price-24h-span"
          >
            {{ lowToFormat }}
          </span>
          <span v-else class="text-gray-400">&mdash;</span>
        </span>
      </CommonMarketInfo>
      <CommonMarketInfo
        v-if="
          market.type === MarketType.Derivative &&
          market.subType === MarketType.Perpetual
        "
        :title="$t('trade.est_funding_rate')"
        :tooltip="$t('trade.funding_rate_tooltip')"
      >
        <span v-if="!fundingRate.isNaN()" class="lg:text-right font-mono block">
          <span
            :class="{
              'text-green-500': fundingRate.gte(0),
              'text-red-500': fundingRate.lt(0)
            }"
            data-cy="market-info-funding-rate-span"
          >
            {{
              (fundingRate.gt(0) ? '+' : '') +
              fundingRate.toFormat(5, BIG_NUMBER_ROUND_DOWN_MODE)
            }}%
          </span>
        </span>
        <span v-else class="lg:text-right font-mono block">&mdash;</span>
      </CommonMarketInfo>
      <PartialsTradingMarketStatsPartialsNextFunding
        v-if="market.subType === MarketType.Perpetual"
        :market="market as UiDerivativeMarketWithToken"
      />
      <PartialsTradingMarketStatsPartialsSettlement
        v-if="market.subType === MarketType.BinaryOptions"
        :market="market as UiDerivativeMarketWithToken"
      />
      <CommonMarketInfo
        v-if="market.subType === MarketType.Futures && timeToExpiry"
        :title="$t('trade.time_to_expiry')"
      >
        <span v-if="!isExpired" class="lg:text-right font-mono block">
          {{ timeToExpiry }}
        </span>
        <span v-else class="lg:text-right font-mono block">&mdash;</span>
      </CommonMarketInfo>
      <CommonMarketInfo
        v-if="market.subType === MarketType.Futures && expiryAt"
        :title="
          $t('trade.expiry_time_with_timezone', { timezone: userTimezone })
        "
      >
        <span v-if="!isExpired" class="lg:text-right font-mono block">
          {{ expiryAt }}
        </span>
        <span v-else class="lg:text-right font-mono block">&mdash;</span>
      </CommonMarketInfo>
    </div>
  </div>
</template>
