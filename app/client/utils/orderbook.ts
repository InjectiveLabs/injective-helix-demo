import { UiPriceLevel, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { UiMarketWithToken } from '@/types'

export const getAggregationPrice = ({
  price,
  aggregation,
  isBuy
}: {
  price: BigNumberInBase
  aggregation: number
  isBuy: boolean
}): BigNumberInBase => {
  const aggregateBy = new BigNumberInBase(10 ** Math.abs(aggregation))

  if (aggregation <= 0) {
    // handles 10, 100 and 1000
    return new BigNumberInBase(
      price
        .dividedBy(aggregateBy)
        .integerValue(
          isBuy ? BigNumberInBase.ROUND_FLOOR : BigNumberInBase.ROUND_CEIL
        )
        .multipliedBy(aggregateBy)
    )
  }

  return new BigNumberInBase(
    price
      .decimalPlaces(
        aggregation,
        isBuy ? BigNumberInBase.ROUND_FLOOR : BigNumberInBase.ROUND_CEIL
      )
      .multipliedBy(aggregateBy)
      .dividedBy(aggregateBy)
  )
}

export const calculateAveragePrice = ({
  isBaseAmount,
  isSpot,
  market,
  records,
  quantity
}: {
  isBaseAmount: boolean
  isSpot: boolean
  records: UiPriceLevel[]
  quantity: BigNumberInBase
  market: UiMarketWithToken
}) => {
  let filledNotional = ZERO_IN_BASE
  let quantityToFill = quantity
  let totalFilledBaseQuantity = ZERO_IN_BASE

  // const logs = []

  const { baseToken, quoteToken } = market

  for (const o of records) {
    const orderQuantity = isSpot
      ? new BigNumberInWei(o.quantity).toBase(baseToken.decimals)
      : new BigNumberInBase(o.quantity)

    const orderPrice = isSpot
      ? new BigNumberInBase(
          new BigNumberInBase(o.price).toWei(
            baseToken.decimals - quoteToken.decimals
          )
        )
      : new BigNumberInWei(o.price).toBase(quoteToken.decimals)

    const orderNotional = orderQuantity.times(orderPrice)
    const quantityToDeduct = isBaseAmount ? orderQuantity : orderNotional
    const quantityConvertedToBase = isBaseAmount
      ? quantityToFill
      : quantityToFill.dividedBy(orderPrice) // baseQuantity calculated using quote amount

    const filledBaseQuantityInOrderbookRow = BigNumberInBase.min(
      orderQuantity,
      quantityConvertedToBase
    )

    totalFilledBaseQuantity = totalFilledBaseQuantity.plus(
      filledBaseQuantityInOrderbookRow
    )
    filledNotional = filledNotional.plus(
      filledBaseQuantityInOrderbookRow.times(orderPrice)
    )

    if (quantityToFill.gt(quantityToDeduct)) {
      quantityToFill = quantityToFill.minus(quantityToDeduct)
    } else {
      break
    }
  }

  // console.table(logs)

  return { filledNotional, totalFilledBaseQuantity }
}

export const calculateWorstPrice = ({
  market,
  isSpot,
  records,
  quantity,
  isBaseAmount
}: {
  isSpot: Boolean
  records: UiPriceLevel[]
  quantity: BigNumberInBase
  market: UiMarketWithToken
  isBaseAmount: boolean
}) => {
  let worstPrice = ZERO_IN_BASE
  let quantityToFill = quantity

  const { baseToken, quoteToken } = market

  for (const o of records) {
    const orderQuantity = isSpot
      ? new BigNumberInWei(o.quantity).toBase(baseToken.decimals)
      : new BigNumberInBase(o.quantity)

    const orderPrice = isSpot
      ? new BigNumberInBase(
          new BigNumberInBase(o.price).toWei(
            baseToken.decimals - quoteToken.decimals
          )
        )
      : new BigNumberInWei(o.price).toBase(quoteToken.decimals)

    const orderNotional = orderQuantity.times(orderPrice)
    const quantityToDeduct = isBaseAmount ? orderQuantity : orderNotional

    worstPrice = orderPrice

    if (quantityToFill.gt(quantityToDeduct)) {
      quantityToFill = quantityToFill.minus(quantityToDeduct)
    } else {
      break
    }
  }

  return { worstPrice }
}
