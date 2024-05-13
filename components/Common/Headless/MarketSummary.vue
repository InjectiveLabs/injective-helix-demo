<script setup lang="ts">
import { Change, MarketType, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'

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

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)
const { lastTradedPrice: derivativeLastTradedPrice } = useDerivativeLastPrice(
  computed(() => props.market)
)

const isSpot = computed(() => props.market.type === MarketType.Spot)

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

const { valueToString: volumeToFormat, valueToBigNumber: volume } =
  useBigNumberFormatter(
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
    return Change.NoChange
  }

  return change.value.gt(0) ? Change.Increase : Change.Decrease
})

const { valueToString: lastTradedPriceToFormat } = useBigNumberFormatter(
  computed(() => lastTradedPrice.value),
  {
    decimalPlaces: props.market.priceDecimals,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: changeToFormat, valueToBigNumber: change } =
  useBigNumberFormatter(
    computed(() => {
      if (!summary.value || !summary.value.change) {
        return ZERO_IN_BASE
      }

      return summary.value.change
    })
  )

const { valueToString: highToFormat, valueToBigNumber: high } =
  useBigNumberFormatter(
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
  useBigNumberFormatter(
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
      percentageChangeStatus,
      lastTradedPriceToFormat
    }"
  />
</template>
