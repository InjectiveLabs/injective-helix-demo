<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedMarketType, SharedMarketChange } from '@shared/types'
import { differenceInSeconds, endOfHour, intervalToDuration } from 'date-fns'
import { stableCoinSymbols } from '@/app/data/token'
import { UiDerivativeMarket, UiMarketWithToken } from '@/types'

const props = defineProps({
  isCurrentMarket: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const tokenStore = useTokenStore()

const labelToDisplay = ['hours', 'minutes', 'seconds']

const now = ref(0)

const countdown = computed(() => {
  const difference = intervalToDuration({
    start: now.value,
    end: endOfHour(now.value)
  })

  return Object.entries(difference)
    .map(([label, value]: [string, number]) => {
      if (labelToDisplay.includes(label)) {
        const valueToTwoDigits = value < 10 ? `0${value}` : `${value}`

        return valueToTwoDigits
      }

      return undefined
    })
    .filter((time) => time)
    .join(':')
})

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)
const { lastTradedPrice: derivativeLastTradedPrice } = useDerivativeLastPrice(
  computed(() => props.market)
)

const isSpot = computed(() => props.market.type === SharedMarketType.Spot)

const summary = computed(() => {
  if (isSpot.value) {
    return spotStore.marketsSummary.find(
      (market) => market.marketId === props.market.marketId
    )
  }

  return derivativeStore.marketsSummary.find(
    (market) => market.marketId === props.market.marketId
  )
})

const isStableQuoteAsset = computed(() =>
  stableCoinSymbols.includes(props.market.quoteToken.symbol)
)

const lastTradedPrice = computed(() => {
  if (props.isCurrentMarket) {
    return isSpot.value
      ? spotLastTradedPrice.value
      : derivativeLastTradedPrice.value
  }

  return new BigNumberInBase(
    summary.value?.lastPrice || summary.value?.price || 0
  )
})

const lastTradedPriceInUsd = computed(() =>
  lastTradedPrice.value.times(tokenStore.tokenUsdPrice(props.market.quoteToken))
)

const { valueToString: volumeToFormat, valueToBigNumber: volume } =
  useSharedBigNumberFormatter(
    computed(() => {
      if (!summary.value) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.value.volume)
    }),
    {
      decimalPlaces: stableCoinSymbols.includes(props.market.quoteToken.symbol)
        ? 0
        : props.market.priceDecimals
    }
  )

const { valueToString: volumeInUsdToFormat } = useSharedBigNumberFormatter(
  computed(() =>
    volume.value.times(tokenStore.tokenUsdPrice(props.market.quoteToken))
  ),
  {
    decimalPlaces: props.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const percentageChangeStatus = computed(() => {
  if (change.value.eq(0)) {
    return SharedMarketChange.NoChange
  }

  return change.value.gt(0)
    ? SharedMarketChange.Increase
    : SharedMarketChange.Decrease
})

const { valueToString: lastTradedPriceToFormat } = useSharedBigNumberFormatter(
  computed(() => lastTradedPrice.value),
  {
    decimalPlaces: props.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: lastTradedPriceInUsdToFormat } =
  useSharedBigNumberFormatter(
    computed(() => lastTradedPriceInUsd.value),
    {
      decimalPlaces: props.market.priceDecimals,
      displayAbsoluteDecimalPlace: true
    }
  )

const { valueToString: changeToFormat, valueToBigNumber: change } =
  useSharedBigNumberFormatter(
    computed(() => {
      if (!summary.value || !summary.value.change) {
        return ZERO_IN_BASE
      }

      return summary.value.change
    })
  )

const { valueToString: highToFormat, valueToBigNumber: high } =
  useSharedBigNumberFormatter(
    computed(() => {
      if (!summary.value) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.value.high)
    }),
    {
      decimalPlaces: props.market.priceDecimals
    }
  )

const { valueToString: lowToFormat, valueToBigNumber: low } =
  useSharedBigNumberFormatter(
    computed(() => {
      if (!summary.value) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.value.low)
    }),
    {
      decimalPlaces: props.market.priceDecimals,
      minimalDecimalPlaces: props.market.priceDecimals
    }
  )

const { valueToBigNumber: tWapEst } = useSharedBigNumberFormatter(
  computed(() => {
    const market = props.market as UiDerivativeMarket

    if (!market.perpetualMarketFunding) {
      return ZERO_IN_BASE
    }

    const currentUnixTime = Math.floor(Date.now() / 1000)
    const divisor = new BigNumberInBase(currentUnixTime).mod(3600).times(24)

    if (divisor.lte(0)) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(
      market.perpetualMarketFunding?.cumulativePrice || 0
    ).dividedBy(divisor)
  })
)

const { valueToBigNumber: fundingRate } = useSharedBigNumberFormatter(
  computed(() => {
    const market = props.market as UiDerivativeMarket

    if (market.subType !== SharedMarketType.Perpetual) {
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

useIntervalFn(() => {
  now.value = Date.now()
  const end = endOfHour(now.value)
  const shouldFetchNewFunding = differenceInSeconds(end, now.value) === 1

  if (shouldFetchNewFunding) {
    derivativeStore.fetchMarket(props.market.marketId)
  }
}, 1000)
</script>

<template>
  <slot
    v-bind="{
      low,
      high,
      change,
      isSpot,
      volume,
      countdown,
      fundingRate,
      lowToFormat,
      highToFormat,
      changeToFormat,
      volumeToFormat,
      lastTradedPrice,
      isStableQuoteAsset,
      volumeInUsdToFormat,
      lastTradedPriceInUsd,
      percentageChangeStatus,
      lastTradedPriceToFormat,
      lastTradedPriceInUsdToFormat
    }"
  />
</template>
