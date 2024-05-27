import { TradeDirection } from '@injectivelabs/ts-types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  UiDerivativeMarket,
  DerivativeTradeTypes,
  DerivativesTradeForm,
  DerivativesTradeFormField,
  TradeAmountOption,
  derivativeMarketKey
} from '@/types'
import {
  calculateTotalQuantity,
  calculateWorstPrice,
  quantizeNumber
} from '@/app/utils/helpers'

export function useDerivativeWorstPrice() {
  const derivativeFormValues = useFormValues<DerivativesTradeForm>()
  const orderbookStore = useOrderbookStore()

  const market = inject(derivativeMarketKey) as Ref<UiDerivativeMarket>

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

    let quantity

    if (isBaseOrder.value) {
      quantity = new BigNumberInBase(
        derivativeFormValues.value[DerivativesTradeFormField.Amount] || 0
      )
    } else {
      // is quote order
      if (isLimitOrder.value) {
        const amount = new BigNumberInBase(
          derivativeFormValues.value[DerivativesTradeFormField.Amount] || 0
        )

        quantity = price ? amount.div(price) : ZERO_IN_BASE
      }

      if (!isLimitOrder.value) {
        // is market order

        const total = new BigNumberInBase(
          derivativeFormValues.value[DerivativesTradeFormField.Amount] || '0'
        )

        const { worstPrice } = calculateTotalQuantity(total.toFixed(), records)

        const worstPriceWithSlippage = worstPrice.times(
          slippagePercentage.value
        )

        const triggerPriceWithSlippage = triggerPrice.times(
          slippagePercentage.value
        )

        if (isStopOrder.value) {
          quantity = triggerPrice
            ? total.div(triggerPriceWithSlippage)
            : ZERO_IN_BASE
        } else {
          quantity = total.div(worstPriceWithSlippage)
        }
      }
    }

    if (!quantity) {
      return ZERO_IN_BASE
    }

    return quantizeNumber(quantity, market.value.quantityTensMultiplier)
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

  const worstPrice = computed(() => {
    const price = new BigNumberInBase(
      derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || 0
    )

    const triggerPrice = new BigNumberInBase(
      derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice] || 0
    )

    let worstPrice

    if (isLimitOrder.value) {
      worstPrice = quantizeNumber(price, market.value.priceTensMultiplier)
    }

    if (!isLimitOrder.value) {
      if (isStopOrder.value) {
        const priceWithSlippage = triggerPrice.times(slippagePercentage.value)

        worstPrice = priceWithSlippage
      } else {
        const records = isBuy.value ? orderbookStore.sells : orderbookStore.buys

        worstPrice = calculateWorstPrice(
          quantity.value.toString(),
          records
        ).worstPrice.times(slippagePercentage.value)
      }
    }

    if (!worstPrice) {
      return ZERO_IN_BASE
    }

    return quantizeNumber(worstPrice, market.value.priceTensMultiplier)
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

  const totalNotionalWithFee = computed(() => {
    return totalNotional.value.plus(feeAmount.value)
  })

  const margin = computed(() => {
    return quantizeNumber(
      totalNotional.value.div(
        derivativeFormValues.value[DerivativesTradeFormField.Leverage] || 1
      ),
      -market.value.quoteToken.decimals
    )
  })

  const marginWithFee = computed(() => {
    return margin.value.plus(feeAmount.value)
  })

  return {
    feePercentage,
    isLimitOrder,
    isStopOrder,
    worstPrice,
    quantity,
    market,
    margin,
    isBuy,
    feeAmount,
    totalNotional,
    marginWithFee,
    minimumAmountInQuote,
    totalNotionalWithFee,
    feePercentageWithLeverage
  }
}
