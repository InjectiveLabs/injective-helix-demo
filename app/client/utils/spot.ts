import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import {
  UiOrderbookPriceLevel,
  UiPriceLevel,
  ZERO_IN_BASE,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'

export const calculateWorstExecutionPriceFromOrderbook = ({
  records,
  market,
  amount
}: {
  records: UiPriceLevel[]
  market: UiSpotMarketWithToken
  amount: BigNumberInBase
}): BigNumberInBase => {
  let remainAmountToFill = amount
  let worstPrice = ZERO_IN_BASE

  for (const record of records) {
    const orderQuantity = new BigNumberInWei(record.quantity).toBase(
      market.baseToken.decimals
    )
    const min = BigNumberInBase.min(remainAmountToFill, orderQuantity)
    remainAmountToFill = remainAmountToFill.minus(min)

    if (remainAmountToFill.lte(0)) {
      return new BigNumberInBase(
        new BigNumberInBase(record.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )
    } else {
      worstPrice = new BigNumberInBase(
        new BigNumberInBase(record.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )
    }
  }

  return worstPrice
}

export const calculateWorstExecutionPriceUsingQuoteAmountAndOrderbook = ({
  records,
  market,
  amount
}: {
  records: UiPriceLevel[]
  market: UiSpotMarketWithToken
  amount: BigNumberInBase
}): BigNumberInBase => {
  let remainQuoteAmountToFill = amount
  let worstPrice = ZERO_IN_BASE

  for (const record of records) {
    const orderQuantity = new BigNumberInWei(record.quantity)
    const orderPrice = new BigNumberInWei(record.price).toBase(
      market.quoteToken.decimals
    )

    const orderNotional = orderQuantity.times(orderPrice)

    const min = BigNumberInBase.min(remainQuoteAmountToFill, orderNotional)

    remainQuoteAmountToFill = remainQuoteAmountToFill.minus(min)

    if (remainQuoteAmountToFill.lte(0)) {
      return new BigNumberInBase(
        new BigNumberInBase(record.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )
    } else {
      worstPrice = new BigNumberInBase(
        new BigNumberInBase(record.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )
    }
  }

  return worstPrice
}

export const calculateAverageExecutionPriceFromOrderbook = ({
  records,
  market,
  amount
}: {
  records: UiPriceLevel[]
  market: UiSpotMarketWithToken
  amount: BigNumberInBase
}): BigNumberInBase => {
  const { sum, remainAmountToFill } = records.reduce(
    ({ sum, remainAmountToFill }, order: UiPriceLevel) => {
      const orderQuantity = new BigNumberInWei(order.quantity).toBase(
        market.baseToken.decimals
      )
      const min = BigNumberInBase.min(remainAmountToFill, orderQuantity)
      const price = new BigNumberInBase(
        new BigNumberInBase(order.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )

      return {
        sum: sum.plus(price.times(min)),
        remainAmountToFill: remainAmountToFill.minus(min)
      }
    },
    { sum: ZERO_IN_BASE, remainAmountToFill: amount }
  )

  return sum.div(amount.minus(remainAmountToFill))
}

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
        .integerValue(isBuy ? BigNumber.ROUND_FLOOR : BigNumber.ROUND_CEIL)
        .multipliedBy(aggregateBy)
    )
  }

  return new BigNumberInBase(
    price
      .decimalPlaces(
        aggregation,
        isBuy ? BigNumber.ROUND_FLOOR : BigNumber.ROUND_CEIL
      )
      .multipliedBy(aggregateBy)
      .dividedBy(aggregateBy)
  )
}

export const computeOrderbookSummary = (
  summary: { quantity: BigNumberInWei; total: BigNumberInBase },
  record: UiOrderbookPriceLevel
) => {
  return {
    quantity: summary.quantity.plus(new BigNumberInWei(record.quantity)),
    total: summary.total.plus(new BigNumberInBase(record.total || 0))
  }
}

export const getApproxAmountForMarketOrder = ({
  records,
  balance,
  market,
  slippage,
  percent = 1
}: {
  records: UiPriceLevel[]
  balance: BigNumberInBase
  percent?: number
  slippage: number
  market: UiSpotMarketWithToken
}) => {
  const fee = new BigNumberInBase(market.takerFeeRate)
  const availableBalance = balance.times(percent)
  let totalQuantity = ZERO_IN_BASE
  let totalNotional: BigNumberInBase

  for (const record of records) {
    const price = new BigNumberInBase(record.price)
      .times(slippage)
      .toWei(market.baseToken.decimals - market.quoteToken.decimals)
    const quantity = new BigNumberInWei(record.quantity).toBase(
      market.baseToken.decimals
    )

    totalQuantity = totalQuantity.plus(quantity)
    totalNotional = totalQuantity.times(price)

    const totalFees = totalNotional.times(fee)
    const total = totalNotional.plus(totalFees)

    if (total.gt(availableBalance)) {
      return availableBalance.dividedBy(fee.plus(1).times(price))
    }
  }

  return totalQuantity
}
