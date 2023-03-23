import type { Ref } from 'vue'
import {
  UiPriceLevel,
  ZERO_IN_BASE,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  ONE_IN_BASE,
  TRADE_FORM_QUANTITY_ROUNDING_MODE
} from '@/app/utils/constants'
import {
  calculateAveragePrice,
  calculateWorstPrice
} from '@/app/client/utils/orderbook'
import { TradeExecutionType, TradeField, TradeForm } from '@/types'

export function useSpotPrice({
  market,
  formValues,
  isBaseAmount
}: {
  market: Ref<UiSpotMarketWithToken | undefined>
  formValues: Ref<TradeForm>
  isBaseAmount: Ref<boolean>
}) {
  const spotStore = useSpotStore()

  const isBuy = computed(() => {
    return formValues.value[TradeField.OrderSide] === OrderSide.Buy
  })

  const orderbookOrders = computed<UiPriceLevel[] | undefined>(() =>
    isBuy.value ? spotStore.sells : spotStore.buys
  )

  const amountForCalculation = computed(() => {
    const amount = isBaseAmount.value
      ? formValues.value[TradeField.BaseAmount]
      : formValues.value[TradeField.QuoteAmount]

    if (!amount) {
      return ONE_IN_BASE
    }

    const amountInBigNumber = new BigNumberInBase(amount)

    if (amountInBigNumber.eq(0) || amountInBigNumber.isNaN()) {
      return ONE_IN_BASE
    }

    return amountInBigNumber
  })

  /*
    Buy: (1 + slippage_tolerance)
    Sell: (1 - slippage_tolerance)
  */
  const slippage = computed(() => {
    const slippage = new BigNumberInBase(
      formValues.value[TradeField.SlippageTolerance] || '0'
    ).div(100)

    return isBuy.value
      ? ONE_IN_BASE.plus(slippage)
      : ONE_IN_BASE.minus(slippage)
  })

  const averagePrice = computed(() => {
    if (
      amountForCalculation.value.lte(0) ||
      !market.value ||
      !orderbookOrders.value ||
      orderbookOrders.value.length === 0
    ) {
      return ZERO_IN_BASE
    }

    const { filledNotional, totalFilledBaseQuantity } = calculateAveragePrice({
      isSpot: true,
      isBaseAmount: isBaseAmount.value,
      records: orderbookOrders.value,
      quantity: amountForCalculation.value,
      market: market.value
    })

    return filledNotional.dividedBy(totalFilledBaseQuantity)
  })

  const worstPrice = computed(() => {
    if (
      amountForCalculation.value.lte(0) ||
      !market.value ||
      !orderbookOrders.value ||
      orderbookOrders.value.length === 0
    ) {
      return ZERO_IN_BASE
    }

    const { worstPrice } = calculateWorstPrice({
      isSpot: true,
      isBaseAmount: isBaseAmount.value,
      records: orderbookOrders.value,
      quantity: amountForCalculation.value,
      market: market.value
    })

    return worstPrice
  })

  const maxAmountOnOrderbook = computed(() => {
    if (!orderbookOrders.value || !market.value) {
      return { totalNotional: ZERO_IN_BASE, totalQuantity: ZERO_IN_BASE }
    }

    const { baseToken, quoteToken } = market.value

    const { totalNotional, totalQuantity } = orderbookOrders.value.reduce(
      ({ totalNotional, totalQuantity }, { quantity, price }) => {
        const orderPrice = new BigNumberInBase(
          new BigNumberInBase(price).toWei(
            baseToken.decimals - quoteToken.decimals
          )
        )
        const orderQuantity = new BigNumberInWei(quantity).toBase(
          baseToken.decimals
        )

        return {
          totalQuantity: totalQuantity.plus(orderQuantity),
          totalNotional: totalNotional.plus(orderQuantity.times(orderPrice))
        }
      },
      { totalNotional: ZERO_IN_BASE, totalQuantity: ZERO_IN_BASE }
    )

    return { totalNotional, totalQuantity }
  })

  const averagePriceWithSlippage = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    const { priceDecimals, quantityDecimals } = market.value
    const decimalPlaces = isBaseAmount.value ? priceDecimals : quantityDecimals

    return new BigNumberInBase(
      averagePrice.value.times(slippage.value).toFixed(decimalPlaces)
    )
  })

  const worstPriceWithSlippage = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    const { priceDecimals } = market.value
    const decimalPlaces = isBaseAmount.value ? priceDecimals : priceDecimals

    return new BigNumberInBase(
      worstPrice.value.times(slippage.value).toFixed(decimalPlaces)
    )
  })

  function updateAmountFromBase({
    amount,
    isBaseAmount: isBaseAmountUpdate
  }: {
    amount?: string
    isBaseAmount: boolean
  }) {
    if (!market.value) {
      return
    }

    const executionPrice =
      formValues.value[TradeField.TradingType] === TradeExecutionType.Market ||
      !formValues.value[TradeField.TradingType]
        ? worstPriceWithSlippage.value
        : new BigNumberInBase(formValues.value[TradeField.LimitPrice])

    if (isBaseAmountUpdate) {
      const updatedQuoteAmount = new BigNumberInBase(
        amount ?? formValues.value[TradeField.BaseAmount]
      ).times(executionPrice)

      if (updatedQuoteAmount.isNaN()) {
        return
      }

      const updatedQuoteAmountToString = updatedQuoteAmount.toFixed(
        market.value.priceDecimals,
        TRADE_FORM_QUANTITY_ROUNDING_MODE
      )

      if (!updatedQuoteAmountToString) {
        return
      }

      return updatedQuoteAmountToString
    } else {
      const baseAmountFromAveragePrice = new BigNumberInBase(
        amount ?? formValues.value[TradeField.QuoteAmount]
      ).dividedBy(executionPrice)

      if (
        baseAmountFromAveragePrice.isNaN() ||
        baseAmountFromAveragePrice.lte(0)
      ) {
        return
      }

      const updatedBaseAmountToString = baseAmountFromAveragePrice.toFixed(
        market.value.quantityDecimals,
        TRADE_FORM_QUANTITY_ROUNDING_MODE
      )

      if (!updatedBaseAmountToString) {
        return
      }

      return updatedBaseAmountToString
    }
  }

  return {
    slippage,
    worstPrice,
    averagePrice,
    maxAmountOnOrderbook,
    updateAmountFromBase,
    amountForCalculation,
    worstPriceWithSlippage,
    averagePriceWithSlippage
  }
}
