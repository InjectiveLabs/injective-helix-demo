import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import {
  calculateTotalQuantity,
  calculateWorstPrice,
  quantizeNumber
} from '@/app/utils/helpers'
import {
  TradeTypes,
  UiSpotMarket,
  SpotTradeForm,
  SpotMarketKey,
  TradeAmountOption,
  SpotTradeFormField
} from '@/types'

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
      TradeAmountOption.Base
  )

  const market = inject(SpotMarketKey) as Ref<UiSpotMarket>

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

    if (isBaseOrder.value) {
      quantity = new BigNumberInBase(
        spotFormValues.value[SpotTradeFormField.Amount] || 0
      )
    }

    if (!isBaseOrder.value) {
      if (isLimitOrder.value) {
        quantity = price
          ? new BigNumberInBase(
              spotFormValues.value[SpotTradeFormField.Amount] || 0
            )
              .div(feePercentage.value)
              .div(price)
          : ZERO_IN_BASE
      }

      if (!isLimitOrder.value) {
        const totalAfterFees = new BigNumberInBase(
          spotFormValues.value[SpotTradeFormField.Amount] || 0
        ).div(feePercentage.value)

        const worstPrice = calculateTotalQuantity(
          totalAfterFees.toFixed(),
          records
        ).worstPrice

        const worstPriceWithSlippage = worstPrice.times(
          slippagePercentage.value
        )

        quantity = totalAfterFees.div(worstPriceWithSlippage)
      }
    }

    return quantizeNumber(quantity, market.value.quantityTensMultiplier)
  })

  const minimumAmountInQuote = computed(() => {
    const price = isLimitOrder.value
      ? new BigNumberInBase(spotFormValues.value[SpotTradeFormField.Price] || 0)
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

      return quantity.value.times(price)
    }

    return new BigNumberInBase(worstPrice.value).times(quantity.value)
  })

  const feeAmount = computed(() => {
    return total.value.times(feePercentage.value.minus(1))
  })

  const totalWithFee = computed(() => {
    return total.value.plus(feeAmount.value)
  })

  return {
    total,
    quantity,
    feeAmount,
    worstPrice,
    totalWithFee,
    feePercentage,
    slippagePercentage,
    minimumAmountInQuote
  }
}
