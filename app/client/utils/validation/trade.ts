import { defineRule } from 'vee-validate'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MAX_SLIPPAGE } from '@/app/utils/constants'

export const tradeErrorMessages = {
  enoughBalance: () => 'Insufficient balance',
  insufficientBalance: () => 'Insufficient balance',
  insufficientOrderbookLiquidity: () => 'Insufficient orderbook liquidity',
  triggerPriceEqualsMarkPrice: () =>
    'The trigger price cannot be the same as the mark price',
  priceTooFarFromLastTradePrice: () =>
    'The execution price for this trade is far from the last traded price',
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
  minAmount: (minBaseAmount: string) => `Amount must be > ${minBaseAmount}`,
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

  defineRule('minAmount', (value: string, [minAmount]: string) => {
    if (!value) {
      return true
    }

    if (new BigNumberInBase(value).lte(minAmount)) {
      return tradeErrorMessages.minAmount(minAmount)
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

  defineRule('insufficientBalanceCustom', (_: string, values: number[]) => {
    if (!values) {
      return true
    }
    const [value, max] = values

    if (new BigNumberInBase(value).gt(max)) {
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

  defineRule('maxLeverage', (value: string | number, [max]: [string]) => {
    const leverage = new BigNumberInBase(value)

    // if (new BigNumberInBase(max).gte(1) && leverage.gt(max)) {
    //   return leverage.eq(1)
    //     ? isBuy
    //       ? tradeErrorMessages.orderPriceHigh()
    //       : tradeErrorMessages.orderPriceLow()
    //     : tradeErrorMessages.maxLeverage()
    // }

    if (leverage.gt(max)) {
      return tradeErrorMessages.maxLeverage()
    }

    return true
  })

  defineRule(
    'priceTooFarFromLastTradePrice',
    (value: string | number, [lastTradedPrice]: [string]) => {
      const DEFAULT_MIN_PRICE_BAND_DIFFERENCE = 20
      const DEFAULT_MAX_PRICE_BAND_DIFFERENCE = 400

      const valueInBigNumber = new BigNumberInBase(value)

      if (valueInBigNumber.eq(0)) {
        return true
      }

      const priceDifferenceInPercentage = valueInBigNumber
        .dividedBy(lastTradedPrice)
        .times(100)

      if (
        valueInBigNumber.lte(lastTradedPrice) &&
        priceDifferenceInPercentage.lte(DEFAULT_MIN_PRICE_BAND_DIFFERENCE)
      ) {
        return tradeErrorMessages.priceTooFarFromLastTradePrice()
      }

      if (
        valueInBigNumber.gt(lastTradedPrice) &&
        priceDifferenceInPercentage.gte(DEFAULT_MAX_PRICE_BAND_DIFFERENCE)
      ) {
        return tradeErrorMessages.priceTooFarFromLastTradePrice()
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

  defineRule('markPriceThresholdError', (_: string, [isError]: string[]) => {
    const isMarkPriceThresholdError = isError === 'true'

    if (isMarkPriceThresholdError) {
      return 'Please modify price, amount, or leverage to meet mark price requirement'
    }
    return true
  })
}
