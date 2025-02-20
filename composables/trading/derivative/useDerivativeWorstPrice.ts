import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradeDirection } from '@injectivelabs/ts-types'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  quantizeNumber,
  calculateWorstPrice,
  calculateTotalQuantity
} from '@/app/utils/helpers'
import {
  TradeAmountOption,
  UiDerivativeMarket,
  DerivativeTradeTypes,
  DerivativesTradeForm,
  DerivativesTradeFormField
} from '@/types'
import {
  DEFAULT_BUY_MAX_SLIPPAGE_FACTOR,
  DEFAULT_SELL_MAX_SLIPPAGE_FACTOR
} from '@/app/utils/constants'

export function useDerivativeWorstPrice(market: Ref<UiDerivativeMarket>) {
  const derivativeFormValues = useFormValues<DerivativesTradeForm>()
  const orderbookStore = useOrderbookStore()

  const isBuy = computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.Side] ===
      TradeDirection.Long
  )

  const isLimitOrder = computed(() =>
    [DerivativeTradeTypes.StopLimit, DerivativeTradeTypes.Limit].includes(
      derivativeFormValues.value[
        DerivativesTradeFormField.Type
      ] as DerivativeTradeTypes
    )
  )

  const isBaseOrder = computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.AmountOption] ===
      TradeAmountOption.Base
  )

  const isStopOrder = computed(() =>
    [DerivativeTradeTypes.StopLimit, DerivativeTradeTypes.StopMarket].includes(
      derivativeFormValues.value[
        DerivativesTradeFormField.Type
      ] as DerivativeTradeTypes
    )
  )

  const feePercentage = computed(() =>
    (isLimitOrder.value &&
      derivativeFormValues.value[DerivativesTradeFormField.PostOnly]) ||
    isStopOrder.value
      ? market.value.makerFeeRate
      : market.value.takerFeeRate
  )

  const feePercentageWithLeverage = computed(() => {
    const leverage =
      derivativeFormValues.value[DerivativesTradeFormField.Leverage] || 1

    const feeWithLeverage = new BigNumberInBase(feePercentage.value).times(
      leverage
    )

    return new BigNumberInBase(1).plus(feeWithLeverage)
  })

  const slippagePercentage = computed(() => {
    if (!derivativeFormValues.value[DerivativesTradeFormField.IsSlippageOn]) {
      return isBuy.value
        ? new BigNumberInBase(1).times(DEFAULT_BUY_MAX_SLIPPAGE_FACTOR)
        : new BigNumberInBase(1).times(DEFAULT_SELL_MAX_SLIPPAGE_FACTOR)
    }

    const slippagePercentage = new BigNumberInBase(
      derivativeFormValues.value[DerivativesTradeFormField.IsSlippageOn]
        ? derivativeFormValues.value[DerivativesTradeFormField.Slippage] || 0
        : 0
    ).div(100)

    const slippage = isBuy.value
      ? new BigNumberInBase(1).plus(slippagePercentage)
      : new BigNumberInBase(1).minus(slippagePercentage)

    return slippage
  })

  const quantity = computed(() => {
    const records = isBuy.value ? orderbookStore.sells : orderbookStore.buys

    const price =
      derivativeFormValues.value[DerivativesTradeFormField.LimitPrice]
    const triggerPrice = new BigNumberInBase(
      derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice] || 0
    )

    if (isBaseOrder.value) {
      const quantity = new BigNumberInBase(
        derivativeFormValues.value[DerivativesTradeFormField.Amount] || 0
      )

      return quantizeNumber(quantity, market.value.quantityTensMultiplier)
    }

    if (isLimitOrder.value) {
      const amount = new BigNumberInBase(
        derivativeFormValues.value[DerivativesTradeFormField.Amount] || 0
      )

      return quantizeNumber(
        price ? amount.div(price) : ZERO_IN_BASE,
        market.value.quantityTensMultiplier
      )
    }

    const total = new BigNumberInBase(
      derivativeFormValues.value[DerivativesTradeFormField.Amount] || '0'
    )
    const { worstPrice } = calculateTotalQuantity(total.toFixed(), records)
    const worstPriceWithSlippage = worstPrice.times(slippagePercentage.value)
    const triggerPriceWithSlippage = triggerPrice.times(
      slippagePercentage.value
    )

    if (isStopOrder.value) {
      return quantizeNumber(
        triggerPrice ? total.div(triggerPriceWithSlippage) : ZERO_IN_BASE,
        market.value.quantityTensMultiplier
      )
    }

    return quantizeNumber(
      total.div(worstPriceWithSlippage),
      market.value.quantityTensMultiplier
    )
  })

  const minimumAmountInQuote = computed(() => {
    const price = isLimitOrder.value
      ? new BigNumberInBase(
          derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || 0
        )
      : new BigNumberInBase(
          isBuy.value
            ? orderbookStore.sells[0]?.price || 0
            : orderbookStore.buys[0]?.price || 0
        )

    const minQuantity = new BigNumberInBase(10).exponentiatedBy(
      market.value.quantityTensMultiplier
    )

    return new BigNumberInBase(
      price
        .times(minQuantity)
        .dp(market.value.priceDecimals, BigNumber.ROUND_UP)
    )
  })

  const calculatedWorstPrice = computed(() => {
    if (isLimitOrder.value) {
      return { hasEnoughLiquidity: true, worstPrice: ZERO_IN_BASE }
    }

    const records = isBuy.value ? orderbookStore.sells : orderbookStore.buys

    return calculateWorstPrice(quantity.value.toString(), records)
  })

  // This is the worst price that will be used to calculate the details (when slippage protection is off)
  const acceptedWorstPrice = computed(() => {
    return quantizeNumber(
      calculatedWorstPrice.value.worstPrice,
      market.value.priceTensMultiplier
    )
  })

  const worstPrice = computed(() => {
    const price = new BigNumberInBase(
      derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || 0
    )

    const triggerPrice = new BigNumberInBase(
      derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice] || 0
    )

    if (isLimitOrder.value) {
      const worstPrice = quantizeNumber(price, market.value.priceTensMultiplier)

      return quantizeNumber(worstPrice, market.value.priceTensMultiplier)
    }

    if (isStopOrder.value) {
      const priceWithSlippage = triggerPrice.times(slippagePercentage.value)

      return quantizeNumber(priceWithSlippage, market.value.priceTensMultiplier)
    }

    const worstPrice = calculatedWorstPrice.value.worstPrice.times(
      slippagePercentage.value
    )

    return quantizeNumber(worstPrice, market.value.priceTensMultiplier)
  })

  const hasEnoughLiquidity = computed(() => {
    if (isLimitOrder.value) {
      return true
    }

    return calculatedWorstPrice.value.hasEnoughLiquidity
  })

  const totalNotional = computed(() => {
    if (isLimitOrder.value) {
      const price =
        derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || 0

      return quantity.value.times(price)
    }

    return new BigNumberInBase(worstPrice.value).times(quantity.value)
  })

  const feeAmount = computed(() =>
    totalNotional.value.times(feePercentage.value)
  )

  const totalNotionalWithFee = computed(() =>
    totalNotional.value.plus(feeAmount.value)
  )

  const margin = computed(() =>
    quantizeNumber(
      totalNotional.value.div(
        derivativeFormValues.value[DerivativesTradeFormField.Leverage] || 1
      ),
      -market.value.quoteToken.decimals
    )
  )

  const marginWithFee = computed(() => margin.value.plus(feeAmount.value))

  const priceForNotional = computed(() => {
    switch (derivativeFormValues.value[DerivativesTradeFormField.Type]) {
      case DerivativeTradeTypes.Limit:
        return new BigNumberInBase(
          derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || 0
        )
      case DerivativeTradeTypes.Market:
        return worstPrice.value
      case DerivativeTradeTypes.StopLimit:
        return new BigNumberInBase(
          derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || 0
        )
      case DerivativeTradeTypes.StopMarket:
        return new BigNumberInBase(
          derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice] ||
            0
        )
    }
  })

  const isNotionalLessThanMinNotional = computed(() => {
    if (
      !priceForNotional.value ||
      priceForNotional.value?.isZero() ||
      new BigNumberInBase(quantity.value).isZero()
    ) {
      return
    }

    return quantity.value
      .times(priceForNotional.value)
      .lt(market.value.minNotionalInToken)
  })

  return {
    isBuy,
    market,
    margin,
    quantity,
    feeAmount,
    worstPrice,
    isStopOrder,
    isLimitOrder,
    feePercentage,
    totalNotional,
    marginWithFee,
    acceptedWorstPrice,
    hasEnoughLiquidity,
    minimumAmountInQuote,
    totalNotionalWithFee,
    feePercentageWithLeverage,
    isNotionalLessThanMinNotional
  }
}
