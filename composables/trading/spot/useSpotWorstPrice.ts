import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  SpotAmountOption,
  SpotTradeForm,
  SpotTradeFormField,
  TradeTypes,
  spotMarketKey
} from '@/types'
import {
  calculateTotalQuantity,
  calculateWorstPrice,
  quantizeNumber
} from '@/app/utils/helpers'

export function useSpotWorstPrice() {
  const spotFormValues = useFormValues<SpotTradeForm>()
  const orderbookStore = useOrderbookStore()

  const isBuy = computed(
    () => spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
  )

  const isLimitOrder = computed(
    () => spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
  )

  const isBaseOrder = computed(
    () =>
      spotFormValues.value[SpotTradeFormField.AmountOption] ===
      SpotAmountOption.Base
  )

  const market = inject(spotMarketKey) as Ref<UiSpotMarketWithToken>

  const feePercentage = computed(() => {
    const feePercentage =
      isLimitOrder.value && spotFormValues.value[SpotTradeFormField.PostOnly]
        ? market.value.makerFeeRate
        : market.value.takerFeeRate

    const fee = isBuy.value
      ? new BigNumberInBase(1).plus(feePercentage)
      : new BigNumberInBase(1).minus(feePercentage)

    return fee
  })

  const slippagePercentage = computed(() => {
    const slippagePercentage = new BigNumberInBase(
      spotFormValues.value[SpotTradeFormField.IsSlippageOn]
        ? spotFormValues.value[SpotTradeFormField.Slippage] || 0
        : 0
    ).div(100)

    const slippage = isBuy.value
      ? new BigNumberInBase(1).plus(slippagePercentage)
      : new BigNumberInBase(1).minus(slippagePercentage)

    return slippage
  })

  const quantity = computed(() => {
    const records = isBuy.value ? orderbookStore.sells : orderbookStore.buys
    const price = spotFormValues.value[SpotTradeFormField.Price] || 0

    let quantity = new BigNumberInBase(0)

    if (isLimitOrder.value && isBaseOrder.value) {
      quantity = new BigNumberInBase(
        spotFormValues.value[SpotTradeFormField.Amount] || 0
      )
    }

    if (isLimitOrder.value && !isBaseOrder.value) {
      quantity = price
        ? new BigNumberInBase(
            spotFormValues.value[SpotTradeFormField.Amount] || 0
          )
            .div(feePercentage.value)
            .div(price)
        : ZERO_IN_BASE
    }

    if (!isLimitOrder.value && isBaseOrder.value) {
      quantity = new BigNumberInBase(
        spotFormValues.value[SpotTradeFormField.Amount] || 0
      )
    }

    if (!isLimitOrder.value && !isBaseOrder.value) {
      const totalAfterFees = new BigNumberInBase(
        spotFormValues.value[SpotTradeFormField.Amount] || 0
      ).div(feePercentage.value)

      const worstPrice = calculateTotalQuantity(
        totalAfterFees.toFixed(),
        records
      ).worstPrice

      const worstPriceWithSlippage = worstPrice.times(slippagePercentage.value)

      quantity = totalAfterFees.div(worstPriceWithSlippage)
    }

    return quantizeNumber(quantity, market.value.quantityTensMultiplier)
  })

  const worstPrice = computed(() => {
    if (isLimitOrder.value) {
      return quantizeNumber(
        new BigNumberInBase(
          spotFormValues.value[SpotTradeFormField.Price] || 0
        ),
        market.value.priceTensMultiplier
      )
    }

    const records = isBuy.value ? orderbookStore.sells : orderbookStore.buys

    return quantizeNumber(
      calculateWorstPrice(quantity.value.toString(), records).worstPrice.times(
        slippagePercentage.value
      ),
      market.value.priceTensMultiplier
    )
  })

  const total = computed(() => {
    if (isLimitOrder.value) {
      const price = spotFormValues.value[SpotTradeFormField.Price] || 0

      return quantity.value.times(price) // .times(feePercentage.value)
    }

    return new BigNumberInBase(worstPrice.value).times(quantity.value)
    // .times(feePercentage.value)
  })

  const feeAmount = computed(() => {
    return total.value.times(feePercentage.value.minus(1))
  })

  const totalWithFee = computed(() => {
    return total.value.plus(feeAmount.value)
  })

  return {
    total,
    totalWithFee,
    quantity,
    worstPrice,
    feeAmount,

    feePercentage,
    slippagePercentage
  }
}
