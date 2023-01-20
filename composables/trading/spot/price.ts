import type { Ref } from 'vue'
import {
  UiPriceLevel,
  UiSpotMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { SpotOrderSide } from '@injectivelabs/sdk-ts'
import { ONE_IN_BASE } from '@/app/utils/constants'
import {
  calculateAveragePrice,
  calculateWorstPrice
} from '@/app/client/utils/orderbook'
import { TradeField, TradeForm } from '@/types'

export function useSpotPrice({
  formValues,
  isBase,
  market
}: {
  formValues: Ref<TradeForm>
  isBase: Ref<boolean>
  market: Ref<UiSpotMarketWithToken | undefined>
}) {
  const spotStore = useSpotStore()

  const isBuy = computed(() => {
    return formValues.value[TradeField.OrderType] === SpotOrderSide.Buy
  })

  const orderbookOrders = computed<UiPriceLevel[] | undefined>(() =>
    isBuy.value ? spotStore.orderbook?.sells : spotStore.orderbook?.buys
  )

  const amountForCalculation = computed(() => {
    const amount = isBase.value
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
      isBase: isBase.value,
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
      isBase: isBase.value,
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
    const decimalPlaces = isBase.value ? priceDecimals : quantityDecimals

    return new BigNumberInBase(
      averagePrice.value.times(slippage.value).toFixed(decimalPlaces)
    )
  })

  const worstPriceWithSlippage = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    const { priceDecimals } = market.value
    const decimalPlaces = isBase.value ? priceDecimals : priceDecimals

    return new BigNumberInBase(
      worstPrice.value.times(slippage.value).toFixed(decimalPlaces)
    )
  })

  return {
    amountForCalculation,
    averagePrice,
    averagePriceWithSlippage,
    maxAmountOnOrderbook,
    slippage,
    worstPrice,
    worstPriceWithSlippage
  }
}
