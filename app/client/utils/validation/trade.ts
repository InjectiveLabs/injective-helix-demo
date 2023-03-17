import { defineRule } from 'vee-validate'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MAX_SLIPPAGE } from '@/app/utils/constants'

export const tradeErrorMessages = {
  enoughBalance: () => 'Insufficient balance',
  insufficientBalance: () => 'Insufficient balance',
  insufficientOrderbookLiquidity: () => 'Insufficient orderbook liquidity',
  triggerPriceEqualsMarkPrice: () =>
    'The trigger price cannot be the same as the mark price',
  priceHighDeviationFromMidOrderbookPrice: () =>
    'The execution price for this trade is far away from the current orderbook mid price',
  orderPriceHigh: () => 'Order price is too high',
  orderPriceLow: () => 'Order price is too low',
  maxLeverage: () => 'Please decrease leverage',
  slippageExceed: () => 'Slippage % can not be higher than 50%',
  slippageTooHigh: () =>
    'Your transaction might be executed at a less desirable price if slippage % is set too high',
  slippageTooLow: () =>
    'Your transaction might not be executed if slippage % is set too low',
  tooHighPostOnlyPrice: () => 'Post-Only limit price is too high',
  tooLowPostOnlyPrice: () => 'Post-Only limit price is too low',
  minBaseAmount: (minBaseAmount: string) =>
    `Base amount must be >= ${minBaseAmount}`,
  quantityTensMultiplier: (tensMultiplier: string) =>
    `Quantity must be a multiple of ${tensMultiplier}`
} as Record<string, any>

export const defineTradeRules = () => {
  defineRule('slippage', (value: string) => {
    const slippage = new BigNumberInBase(value)

    if (slippage.gt(MAX_SLIPPAGE)) {
      return tradeErrorMessages.slippageExceed()
    }

    if (slippage.gt(5)) {
      return tradeErrorMessages.slippageTooHigh()
    }

    if (slippage.lt(0.05)) {
      return tradeErrorMessages.slippageTooLow()
    }

    return true
  })

  defineRule(
    'enoughBalance',
    (value: string | number, [min, max]: number[]) => {
      /* TODO: refactor this to two separate rules, one for min and the other for max */
      if (Number(value) >= Number(min) && Number(value) <= Number(max)) {
        return true
      }

      return tradeErrorMessages.enoughBalance()
    }
  )

  defineRule('minBaseAmount', (value: string, [minAmount]: string) => {
    if (!value) {
      return true
    }

    if (new BigNumberInBase(value).lt(minAmount)) {
      return tradeErrorMessages.minBaseAmount(minAmount)
    }

    return true
  })

  defineRule('insufficientBalance', (value: string, max: number[]) => {
    if (!value) {
      return true
    }

    if (new BigNumberInBase(value).gt(max[0])) {
      return tradeErrorMessages.insufficientBalance()
    }

    return true
  })

  defineRule(
    'maxOrderbookLiquidity',
    (value: string, orderbookQuantities: string[]) => {
      if (!value) {
        return true
      }

      const [orderbookQuantity] = orderbookQuantities

      if (new BigNumberInBase(value).gt(orderbookQuantity)) {
        return tradeErrorMessages.insufficientOrderbookLiquidity()
      }

      return true
    }
  )

  defineRule(
    'triggerPriceEqualsMarkPrice',
    (value: string, markPrice: string) => {
      if (!value) {
        return true
      }

      if (new BigNumberInBase(value).eq(new BigNumberInBase(markPrice))) {
        return tradeErrorMessages.triggerPriceEqualsMarkPrice()
      }

      return true
    }
  )

  defineRule(
    'maxLeverage',
    (value: string | number, [max, isBuy]: [string, boolean]) => {
      const leverage = new BigNumberInBase(value)

      if (new BigNumberInBase(max).gte(1) && leverage.gt(max)) {
        return leverage.eq(1)
          ? isBuy
            ? tradeErrorMessages.orderPriceHigh()
            : tradeErrorMessages.orderPriceLow()
          : tradeErrorMessages.maxLeverage()
      }

      return true
    }
  )

  defineRule(
    'priceHighDeviationFromMidOrderbookPrice',
    (
      value: string | number,
      [cappedAcceptableMin, acceptableMax]: string[]
    ) => {
      const executionPrice = new BigNumberInBase(value)

      if (
        executionPrice.lt(cappedAcceptableMin) ||
        executionPrice.gt(acceptableMax)
      ) {
        return tradeErrorMessages.priceHighDeviationFromMidOrderbookPrice()
      }

      return true
    }
  )

  defineRule(
    'invalidPostOnlyPrice',
    (value: string | number, [orderbookPrice, isBuy]: string[]) => {
      const isBuyOrder = isBuy === 'true'

      if (isBuyOrder && new BigNumberInBase(value).gte(orderbookPrice)) {
        return tradeErrorMessages.tooHighPostOnlyPrice()
      } else if (
        !isBuyOrder &&
        new BigNumberInBase(value).lte(orderbookPrice)
      ) {
        return tradeErrorMessages.tooLowPostOnlyPrice()
      }

      return true
    }
  )

  defineRule(
    'quantityTensMultiplier',
    (value: string | number, [quantityTensMultiplier]: string[]) => {
      const tensMul = new BigNumberInBase(10)
        .pow(quantityTensMultiplier)
        .toNumber()

      if (Number(value) % tensMul !== 0) {
        return tradeErrorMessages.quantityTensMultiplier(tensMul)
      }

      return true
    }
  )
}
