<script lang="ts" setup>
import { SharedMarketType } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { getAggregationPrice } from '@/app/client/utils/orderbook'
import { UI_DEFAULT_MAX_NUMBER_OF_ORDERS } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

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

const MAX_DECIMALS_FOR_AGGREGATION_KEY = 9
const isSpot = props.market.type === SharedMarketType.Spot

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
        MAX_DECIMALS_FOR_AGGREGATION_KEY
      ) as keyof typeof aggregatedRecords
      const quantity = isSpot
        ? new BigNumberInWei(record.quantity).toBase(
            props.market.baseToken.decimals
          )
        : new BigNumberInBase(record.quantity)
      const total = quantity.times(price)

      if (
        Object.keys(aggregatedRecords).length > UI_DEFAULT_MAX_NUMBER_OF_ORDERS
      ) {
        lowestBuyAggregation = lowestBuyAggregation || aggregatedPriceKey

        return {
          ...aggregatedRecords,
          [lowestBuyAggregation]: {
            quantity: new BigNumberInBase(quantity)
              .plus(aggregatedRecords[lowestBuyAggregation]?.quantity || 0)
              .toFixed(),
            total: new BigNumberInBase(total)
              .plus(aggregatedRecords[lowestBuyAggregation]?.total || 0)
              .toFixed()
          }
        }
      }

      return {
        ...aggregatedRecords,
        [aggregatedPriceKey]: {
          quantity: new BigNumberInBase(quantity)
            .plus(aggregatedRecords[aggregatedPriceKey]?.quantity || 0)
            .toFixed(),
          total: new BigNumberInBase(total)
            .plus(aggregatedRecords[aggregatedPriceKey]?.total || 0)
            .toFixed()
        }
      }
    },
    {} as Record<string, { quantity: string; total: string }>
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
        MAX_DECIMALS_FOR_AGGREGATION_KEY
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
          [highestSellAggregation]: {
            quantity: new BigNumberInBase(quantity)
              .plus(aggregatedRecords[highestSellAggregation]?.quantity || 0)
              .toFixed(),
            total: new BigNumberInBase(quantity.times(highestSellAggregation))
              .plus(aggregatedRecords[highestSellAggregation]?.total || 0)
              .toFixed()
          }
        }
      }

      return {
        ...aggregatedRecords,
        [aggregatedPriceKey]: {
          quantity: new BigNumberInBase(quantity)
            .plus(aggregatedRecords[aggregatedPriceKey]?.quantity || 0)
            .toFixed(),
          total: new BigNumberInBase(quantity.times(price))
            .plus(aggregatedRecords[aggregatedPriceKey]?.total || 0)
            .toFixed()
        }
      }
    },
    {} as Record<string, { quantity: string; total: string }>
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
