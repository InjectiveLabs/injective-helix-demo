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
import {
  formatPriceToAllowableDecimals,
  formatAmountToAllowableDecimals
} from '~/app/utils/formatters'

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

export const calculateWorstPriceUsingQuoteAmountAndOrderBookNonSwap = ({
  records,
  market,
  quoteAmount,
  orderTypeBuy,
  feeRate
}: {
  records: UiPriceLevel[]
  market: UiSpotMarketWithToken
  quoteAmount: BigNumberInBase
  orderTypeBuy: Boolean
  feeRate: BigNumberInBase
}): BigNumberInBase => {
  let remainQuoteAmountToFill = quoteAmount
  let worstPrice = ZERO_IN_BASE
  const ONE_IN_BASE = new BigNumberInBase(1)
  const fee = orderTypeBuy
    ? ONE_IN_BASE.minus(feeRate)
    : ONE_IN_BASE.plus(feeRate)

  for (const record of records) {
    const orderQuantity = new BigNumberInWei(record.quantity)
    const orderPrice = new BigNumberInWei(record.price).toBase(
      market.quoteToken.decimals
    )

    const orderNotional = orderQuantity.times(orderPrice)

    const min = BigNumberInBase.min(remainQuoteAmountToFill, orderNotional)

    remainQuoteAmountToFill = remainQuoteAmountToFill.minus(min)

    if (remainQuoteAmountToFill.lte(0)) {
      return new BigNumberInWei(record.price)
        .toBase(market.quoteToken.decimals)
        .times(fee)
    } else {
      worstPrice = new BigNumberInWei(record.price).toBase(
        market.quoteToken.decimals
      )
    }
  }

  return worstPrice.times(fee)
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

  const averagePrice = sum.div(amount.minus(remainAmountToFill))

  return new BigNumberInBase(
    formatPriceToAllowableDecimals(
      averagePrice.toNumber(),
      market.priceDecimals
    )
  )
}

export const calculateAverageExecutionPriceFromFillableNotionalOnOrderBook = ({
  records,
  market,
  quoteAmount
}: {
  records: UiPriceLevel[]
  market: UiSpotMarketWithToken
  quoteAmount: BigNumberInBase
}) => {
  const { amount, sum } = records.reduce(
    ({ amount, sum, remainNotionalToFill }, order: UiPriceLevel) => {
      const orderQuantity = new BigNumberInWei(order.quantity).toBase(
        market.baseToken.decimals
      )

      const orderPrice = new BigNumberInBase(
        new BigNumberInBase(order.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )

      const orderNotional = orderQuantity.times(orderPrice)

      const minNotional = BigNumberInBase.min(
        remainNotionalToFill,
        orderNotional
      )

      const additionalQuantity = orderQuantity.times(
        minNotional.div(orderNotional)
      )

      return {
        sum: remainNotionalToFill.gt(0)
          ? sum.plus(orderPrice.times(additionalQuantity))
          : sum,
        amount: amount.plus(additionalQuantity),
        remainNotionalToFill: remainNotionalToFill.minus(minNotional)
      }
    },
    {
      sum: ZERO_IN_BASE,
      amount: ZERO_IN_BASE,
      remainNotionalToFill: quoteAmount
    }
  )

  const averagePrice = sum.div(amount)

  return new BigNumberInBase(
    formatPriceToAllowableDecimals(averagePrice.toFixed(), market.priceDecimals)
  )
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

export const getSpotBaseAmountForPercentageSell = ({
  buys,
  baseAvailableBalance,
  market,
  percentageToNumber
}: {
  buys: UiPriceLevel[]
  baseAvailableBalance: BigNumberInBase
  market: UiSpotMarketWithToken
  percentageToNumber: BigNumberInBase
}) => {
  const totalFillableAmount = buys.reduce((totalAmount, { quantity }) => {
    return totalAmount.plus(
      new BigNumberInWei(quantity).toBase(market.baseToken.decimals)
    )
  }, ZERO_IN_BASE)

  const percentageBaseAvailableBalance = new BigNumberInBase(
    baseAvailableBalance
  ).times(percentageToNumber)

  const amount = totalFillableAmount.gte(percentageBaseAvailableBalance)
    ? percentageBaseAvailableBalance
    : totalFillableAmount

  return formatAmountToAllowableDecimals(
    amount.toNumber(),
    market.quantityDecimals
  )
}

export const getSpotBaseAmountForPercentageBuy = ({
  sells,
  quoteAvailableBalance,
  market,
  percentageToNumber = 1,
  feeRate,
  executionPrice
}: {
  sells: UiPriceLevel[]
  quoteAvailableBalance: BigNumberInBase
  percentageToNumber?: number
  market: UiSpotMarketWithToken
  feeRate: BigNumberInBase
  executionPrice: BigNumberInBase
}) => {
  const percentageQuoteAvailableBalance =
    quoteAvailableBalance.times(percentageToNumber)
  let totalQuantity = ZERO_IN_BASE
  let totalNotional = ZERO_IN_BASE

  for (const record of sells) {
    const price = new BigNumberInBase(record.price).toWei(
      market.baseToken.decimals - market.quoteToken.decimals
    )
    const quantity = new BigNumberInWei(record.quantity).toBase(
      market.baseToken.decimals
    )

    totalQuantity = totalQuantity.plus(quantity)
    totalNotional = totalQuantity.times(price)

    const totalFees = totalNotional.times(feeRate)

    const total = totalNotional.plus(totalFees)

    if (total.gt(percentageQuoteAvailableBalance)) {
      const amount = new BigNumberInBase(quoteAvailableBalance)
        .dividedBy(executionPrice.times(feeRate.plus(1)))
        .times(percentageToNumber)

      return formatAmountToAllowableDecimals(
        amount.toNumber(),
        market.quantityDecimals
      )
    }
  }

  return formatAmountToAllowableDecimals(
    totalQuantity.toNumber(),
    market.quantityDecimals
  )
}

export const getSpotQuoteForPercentageSell = ({
  buys,
  market,
  baseAvailableBalance,
  percentToNumber,
  executionPrice,
  feeRate
}: {
  buys: UiPriceLevel[]
  market: UiSpotMarketWithToken
  baseAvailableBalance: BigNumberInBase
  percentToNumber: BigNumberInBase
  executionPrice: BigNumberInBase
  feeRate: BigNumberInBase
}) => {
  const { totalFillableAmount, totalNotional } = buys.reduce(
    ({ totalFillableAmount, totalNotional }, { quantity, price }) => {
      const orderPrice = new BigNumberInBase(price).toWei(
        market.baseToken.decimals - market.quoteToken.decimals
      )

      const orderQuantity = new BigNumberInWei(quantity).toBase(
        market.baseToken.decimals
      )

      return {
        totalFillableAmount: totalFillableAmount.plus(orderQuantity),
        totalNotional: totalNotional.plus(orderQuantity.times(orderPrice))
      }
    },
    {
      totalFillableAmount: ZERO_IN_BASE,
      totalNotional: ZERO_IN_BASE
    }
  )

  const percentageBaseAvailableBalance = new BigNumberInBase(
    baseAvailableBalance
  ).times(percentToNumber)

  const notionalBalance = percentageBaseAvailableBalance
    .times(executionPrice)
    .times(new BigNumberInBase(1).minus(feeRate))

  if (percentageBaseAvailableBalance.gt(totalFillableAmount)) {
    return formatAmountToAllowableDecimals(
      totalNotional.toNumber(),
      market.priceDecimals
    )
  }

  return formatAmountToAllowableDecimals(
    notionalBalance.toNumber(),
    market.priceDecimals
  )
}

export const getSpotQuoteForPercentageBuy = ({
  sells,
  market,
  quoteAvailableBalance,
  percentToNumber,
  takerFeeRate
}: {
  sells: UiPriceLevel[]
  market: UiSpotMarketWithToken
  quoteAvailableBalance: BigNumberInBase
  percentToNumber: BigNumberInBase
  takerFeeRate: BigNumberInBase
}) => {
  let totalNotional = ZERO_IN_BASE

  for (const record of sells) {
    const price = new BigNumberInBase(record.price).toWei(
      market.baseToken.decimals - market.quoteToken.decimals
    )

    const quantity = new BigNumberInWei(record.quantity).toBase(
      market.baseToken.decimals
    )

    totalNotional = totalNotional.plus(price.times(quantity))
  }

  const totalFees = totalNotional.times(takerFeeRate)
  const total = totalNotional.plus(totalFees)

  const quoteBalance = quoteAvailableBalance.times(percentToNumber)

  if (total.gt(quoteBalance)) {
    return formatAmountToAllowableDecimals(
      quoteBalance.toNumber(),
      market.priceDecimals
    )
  }

  return formatAmountToAllowableDecimals(
    totalNotional.toNumber(),
    market.priceDecimals
  )
}

export const determineIfSpotQuoteAvailableBalanceExceedsOrderbookSellSideNotionalForBuy =
  ({
    sells,
    quoteAvailableBalance,
    market,
    percentageToNumber = 1,
    feeRate,
    executionPrice
  }: {
    sells: UiPriceLevel[]
    quoteAvailableBalance: BigNumberInBase
    percentageToNumber?: number
    market: UiSpotMarketWithToken
    feeRate: BigNumberInBase
    executionPrice: BigNumberInBase
  }) => {
    const percentageQuoteAvailableBalance =
      quoteAvailableBalance.times(percentageToNumber)
    let totalQuantity = ZERO_IN_BASE
    let totalNotional = ZERO_IN_BASE

    for (const record of sells) {
      const price = new BigNumberInBase(record.price).toWei(
        market.baseToken.decimals - market.quoteToken.decimals
      )
      const quantity = new BigNumberInWei(record.quantity).toBase(
        market.baseToken.decimals
      )

      totalQuantity = totalQuantity.plus(quantity)
      totalNotional = totalQuantity.times(price)

      const totalFees = totalNotional.times(feeRate)

      const total = totalNotional.plus(totalFees)

      if (total.gt(percentageQuoteAvailableBalance)) {
        const amount = new BigNumberInBase(quoteAvailableBalance)
          .dividedBy(executionPrice.times(feeRate.plus(1)))
          .times(percentageToNumber)

        return formatAmountToAllowableDecimals(
          amount.toNumber(),
          market.quantityDecimals
        )
      }
    }

    return formatAmountToAllowableDecimals(
      totalQuantity.toNumber(),
      market.quantityDecimals
    )
  }
