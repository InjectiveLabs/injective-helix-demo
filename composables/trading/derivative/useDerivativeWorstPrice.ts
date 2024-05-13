import {
  UiDerivativeMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  DerivativeTradeTypes,
  DerivativesTradeForm,
  DerivativesTradeFormField,
  TradeAmountOption,
  derivativeMarketKey
} from '@/types'
import { calculateTotalQuantity } from '~/app/utils/helpers'

export function useDerivativeWorstPrice() {
  const derivativeFormValues = useFormValues<DerivativesTradeForm>()
  const orderbookStore = useOrderbookStore()

  const market = inject(derivativeMarketKey) as Ref<UiDerivativeMarketWithToken>

  const isBuy = computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.Side] ===
      OrderSide.Buy
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
  const feePercentage = computed(() => {
    const feePercentage =
      (isLimitOrder.value &&
        derivativeFormValues.value[DerivativesTradeFormField.PostOnly]) ||
      isStopOrder.value
        ? market.value.makerFeeRate
        : market.value.takerFeeRate

    const fee = isBuy.value
      ? new BigNumberInBase(1).plus(feePercentage)
      : new BigNumberInBase(1).minus(feePercentage)

    return fee
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
      return derivativeFormValues.value[DerivativesTradeFormField.Amount]
    }

    // is quote order

    if (isLimitOrder.value) {
      const amount = new BigNumberInBase(
        derivativeFormValues.value[DerivativesTradeFormField.Amount] || 0
      )

      quantity = price
        ? amount.div(feePercentage.value).div(price)
        : ZERO_IN_BASE
    }

    if (!isLimitOrder.value) {
      const totalAfterFees = new BigNumberInBase(
        derivativeFormValues.value[DerivativesTradeFormField.Amount] || 0
      ).div(feePercentage.value)

      const worstPrice = calculateTotalQuantity(
        totalAfterFees.toFixed(),
        records
      ).worstPrice

      const worstPriceWithSlippage = worstPrice.times(slippagePercentage.value)

      const triggerPriceWithSlippage = triggerPrice.times(
        slippagePercentage.value
      )

      if (isStopOrder.value) {
        quantity = triggerPrice
          ? totalAfterFees.div(triggerPriceWithSlippage)
          : 0
      } else {
        quantity = totalAfterFees.div(worstPriceWithSlippage)
      }
    }

    return quantity
  })

  const total = computed(() => {
    return 2
  })

  const margin = computed(() => {
    return 1
  })

  return {
    feePercentage,
    isLimitOrder,
    isStopOrder,
    quantity,
    market,
    margin,
    isBuy,
    total
  }
}
