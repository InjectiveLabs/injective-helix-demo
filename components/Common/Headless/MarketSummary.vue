<script setup lang="ts">
import { USDT_DENOM, ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedMarketType, SharedMarketChange } from '@shared/types'
import { stableCoinDenoms } from '@/app/data/token'
import { UiMarketWithToken } from '@/types'

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

const isNonUsdtQuoteAsset = computed(() => {
  return props.market.quoteToken.denom !== USDT_DENOM
})

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

const lastTradedPriceInUsd = computed(() => {
  return lastTradedPrice.value.times(
    tokenStore.tokenUsdPrice(props.market.quoteToken)
  )
})

const { valueToString: volumeToFormat, valueToBigNumber: volume } =
  useSharedBigNumberFormatter(
    computed(() => {
      if (!summary.value) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.value.volume)
    }),
    {
      decimalPlaces: stableCoinDenoms.includes(props.market.quoteToken.symbol)
        ? 0
        : props.market.priceDecimals
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
</script>

<template>
  <slot
    v-bind="{
      low,
      high,
      lowToFormat,
      highToFormat,
      change,
      isSpot,
      volume,
      changeToFormat,
      volumeToFormat,
      lastTradedPrice,
      isNonUsdtQuoteAsset,
      lastTradedPriceInUsd,
      lastTradedPriceInUsdToFormat,
      percentageChangeStatus,
      lastTradedPriceToFormat
    }"
  />
</template>
