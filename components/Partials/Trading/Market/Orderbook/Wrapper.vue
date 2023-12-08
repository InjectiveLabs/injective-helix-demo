<script lang="ts" setup>
import { MarketType, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { UI_DEFAULT_MAX_NUMBER_OF_ORDERS } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'
import { getAggregationPrice } from '@/app/client/utils/orderbook'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const props = defineProps({
  aggregation: {
    type: Number,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot

const buys = computed(() => (isSpot ? spotStore.buys : derivativeStore.buys))
const sells = computed(() => (isSpot ? spotStore.sells : derivativeStore.sells))

const aggregatedBuys = computed(() => {
  let lowestBuyAggregation = ''

  return buys.value.reduce(
    (aggregatedRecords, record) => {
      const price = new BigNumberInBase(
        isSpot
          ? new BigNumberInBase(record.price).toWei(
              props.market.baseToken.decimals - props.market.quoteToken.decimals
            )
          : new BigNumberInWei(record.price).toBase(
              props.market.quoteToken.decimals
            )
      )

      const aggregatedPrice = getAggregationPrice({
        price,
        isBuy: true,
        aggregation: props.aggregation
      })
      const aggregatedPriceKey = aggregatedPrice.toFixed(
        9
      ) as keyof typeof aggregatedRecords
      const quantity = isSpot
        ? new BigNumberInWei(record.quantity).toBase(
            props.market.baseToken.decimals
          )
        : new BigNumberInBase(record.quantity)

      if (
        Object.keys(aggregatedRecords).length > UI_DEFAULT_MAX_NUMBER_OF_ORDERS
      ) {
        lowestBuyAggregation = lowestBuyAggregation || aggregatedPriceKey

        return {
          ...aggregatedRecords,
          [lowestBuyAggregation]: new BigNumberInBase(quantity)
            .plus(aggregatedRecords[lowestBuyAggregation] || 0)
            .toFixed()
        }
      }

      return {
        ...aggregatedRecords,
        [aggregatedPriceKey]: new BigNumberInBase(quantity)
          .plus(aggregatedRecords[aggregatedPriceKey] || 0)
          .toFixed()
      }
    },
    {} as Record<string, string>
  )
})

const aggregatedSells = computed(() => {
  let highestSellAggregation = ''

  return sells.value.reduce(
    (aggregatedRecords, record) => {
      const price = new BigNumberInBase(
        isSpot
          ? new BigNumberInBase(record.price).toWei(
              props.market.baseToken.decimals - props.market.quoteToken.decimals
            )
          : new BigNumberInWei(record.price).toBase(
              props.market.quoteToken.decimals
            )
      )

      const aggregatedPrice = getAggregationPrice({
        price,
        isBuy: false,
        aggregation: props.aggregation
      })
      const aggregatedPriceKey = aggregatedPrice.toFixed(
        6
      ) as keyof typeof aggregatedRecords
      const quantity = isSpot
        ? new BigNumberInWei(record.quantity).toBase(
            props.market.baseToken.decimals
          )
        : new BigNumberInBase(record.quantity)

      if (
        Object.keys(aggregatedRecords).length > UI_DEFAULT_MAX_NUMBER_OF_ORDERS
      ) {
        highestSellAggregation = highestSellAggregation || aggregatedPriceKey

        return {
          ...aggregatedRecords,
          [highestSellAggregation]: new BigNumberInBase(quantity)
            .plus(aggregatedRecords[highestSellAggregation] || 0)
            .toFixed()
        }
      }

      return {
        ...aggregatedRecords,
        [aggregatedPriceKey]: new BigNumberInBase(quantity)
          .plus(aggregatedRecords[aggregatedPriceKey] || 0)
          .toFixed()
      }
    },
    {} as Record<string, string>
  )
})

const midPrice = computed(() => {
  const [sell] = sells.value
  const [buy] = buys.value
  const highestBuy = new BigNumberInBase(buy ? buy.price : 0)
  const lowestSell = new BigNumberInBase(sell ? sell.price : 0)
  const sum = highestBuy.plus(lowestSell)

  if (sum.lte(0)) {
    return ZERO_IN_BASE.toFixed()
  }

  return isSpot
    ? new BigNumberInBase(sum.div(2))
        .toWei(
          props.market.baseToken.decimals - props.market.quoteToken.decimals
        )
        .toFixed()
    : new BigNumberInWei(sum.div(2))
        .toBase(props.market.quoteToken.decimals)
        .toFixed()
})
</script>

<template>
  <PartialsTradingMarketOrderbook
    v-bind="{
      market,
      midPrice,
      aggregation,
      aggregatedBuyOrders: aggregatedBuys,
      aggregatedSellOrders: aggregatedSells
    }"
  />
</template>
