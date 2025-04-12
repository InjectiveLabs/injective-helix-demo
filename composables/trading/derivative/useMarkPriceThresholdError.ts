import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { excludedPriceDeviationSlugs } from '@/app/data/market'
import { UiDerivativeMarket, DerivativeTradeTypes } from '@/types'

export function useMarkPriceThresholdError({
  type,
  price,
  isBuy,
  market,
  quantity,
  markPrice,
  triggerPrice,
  marginWithFee
}: {
  isBuy: Ref<boolean>
  markPrice: Ref<string>
  price: Ref<BigNumberInBase>
  quantity: Ref<BigNumberInBase>
  marginWithFee: Ref<BigNumberInBase>
  triggerPrice: Ref<string | undefined>
  market: Ref<UiDerivativeMarket | undefined>
  type: Ref<DerivativeTradeTypes | undefined>
}) {
  /**
   * Computes whether the current Mark Price violates margin requirements.
   *
   * Chain Rules
   * - **For Buy Orders (Longs):
   *   Mark Price must not fall below the threshold:
   *   MarkPrice >= (Margin - (Entry Price * Quantity)) / ((IMR - 1) * Quantity)

   * - **For Sell Orders (Shorts):
   *   Mark Price must not exceed the threshold:
   *   MarkPrice <= (Margin + (Entry Price * Quantity)) / ((1 + IMR) * Quantity)
   */

  const isMarkPriceThresholdError = computed(() => {
    const markPriceInBigNumber = new BigNumberInBase(markPrice.value || 0)

    if (
      !price.value ||
      !market.value ||
      !quantity.value ||
      markPriceInBigNumber.isZero()
    ) {
      return false
    }

    if (excludedPriceDeviationSlugs.includes(market.value.ticker)) {
      return false
    }

    if (markPriceInBigNumber.lte(0)) {
      return true
    }

    const notionalWithoutLeverage = price.value.times(
      quantity.value || ZERO_IN_BASE
    )

    // if notional is price * quantity, that is max exposure
    // Buy Orders subtracts because the margin is used to open the position, and remaining margin needs to be tracked
    // Sell Orders adds because in a short, your exposure grows with the price, increasing required margin
    const notionalAfterMarginAdjustment = isBuy.value
      ? marginWithFee.value.minus(notionalWithoutLeverage)
      : marginWithFee.value.plus(notionalWithoutLeverage)

    // Buys: IMR - 1
    // Sells: 1 + IMR
    const marginRatio = isBuy.value
      ? new BigNumberInBase(market.value.initialMarginRatio).minus(1)
      : new BigNumberInBase(1).plus(market.value.initialMarginRatio)

    // calculate thresholdMarkPrice, the minimum or maximum price at which a position can be maintained without violating margin requirements
    const amountWithInitialMarginRatio = marginRatio.times(
      quantity.value || ZERO_IN_BASE
    )
    const thresholdMarkPrice = notionalAfterMarginAdjustment.div(
      amountWithInitialMarginRatio
    )

    const isConditionalMarketOrder =
      type.value === DerivativeTradeTypes.StopMarket

    const triggerPriceToBigNumber = new BigNumberInBase(
      triggerPrice.value || '0'
    )

    // validate mark price against markPriceThreshold
    const isMarkPriceBelowThreshold = isConditionalMarketOrder
      ? markPriceInBigNumber.lt(thresholdMarkPrice) ||
        triggerPriceToBigNumber.lt(thresholdMarkPrice)
      : markPriceInBigNumber.lt(thresholdMarkPrice)

    const isMarkPriceAboveThreshold = isConditionalMarketOrder
      ? markPriceInBigNumber.gt(thresholdMarkPrice) ||
        triggerPriceToBigNumber.gt(thresholdMarkPrice)
      : markPriceInBigNumber.gt(thresholdMarkPrice)

    // Buys: mark price should not be below thresholdMarkPrice
    // Sells: mark price should not be above thresholdMarkPrice
    const isBuyMarkPriceBelowThreshold =
      isBuy.value && isMarkPriceBelowThreshold
    const isSellMarkPriceAboveThreshold =
      !isBuy.value && isMarkPriceAboveThreshold

    return isBuyMarkPriceBelowThreshold || isSellMarkPriceAboveThreshold
  })

  return {
    isMarkPriceThresholdError
  }
}
