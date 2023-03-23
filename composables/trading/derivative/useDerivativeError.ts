import type { Ref } from 'vue'
import {
  MarketType,
  ZERO_IN_BASE,
  UiPriceLevel,
  UiPerpetualMarketWithToken,
  UiDerivativeMarketWithToken,
  UiExpiryFuturesMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  DEFAULT_PRICE_WARNING_DEVIATION,
  UI_DEFAULT_MAX_NUMBER_OF_ORDERS
} from '@/app/utils/constants'
import { excludedPriceDeviationSlugs } from '@/app/data/market'
import { TradeExecutionType, TradeField, TradeForm } from '@/types'

export function useDerivativeError({
  isBuy,
  market,
  markPrice,
  formValues,
  executionPrice,
  orderTypeReduceOnly,
  notionalWithLeverage,
  quoteAvailableBalance,
  worstPriceWithSlippage,
  notionalWithLeverageAndFees,
  notionalWithLeverageBasedOnWorstPrice
}: {
  isBuy: Ref<boolean>
  markPrice: Ref<string>
  formValues: Ref<TradeForm>
  executionPrice: Ref<BigNumberInBase>
  market: Ref<UiDerivativeMarketWithToken>
  orderTypeReduceOnly: Ref<BigNumberInBase>
  notionalWithLeverage: Ref<BigNumberInBase>
  quoteAvailableBalance: Ref<BigNumberInBase>
  worstPriceWithSlippage: Ref<BigNumberInBase>
  notionalWithLeverageAndFees: Ref<BigNumberInBase>
  notionalWithLeverageBasedOnWorstPrice: Ref<BigNumberInBase>
}) {
  const derivativeStore = useDerivativeStore()

  const tradingTypeMarket = computed(
    () => formValues.value[TradeField.TradingType] === TradeExecutionType.Market
  )

  const tradingTypeStopMarket = computed(
    () =>
      formValues.value[TradeField.TradingType] === TradeExecutionType.StopMarket
  )

  const lastTradedPrice = computed(() => {
    if (derivativeStore.trades.length === 0) {
      return ZERO_IN_BASE
    }

    const [trade] = derivativeStore.trades

    return new BigNumberInBase(
      new BigNumberInWei(trade.executionPrice).toBase(
        market.value.quoteToken.decimals
      )
    )
  })

  const highDeviation = computed<boolean>(() => {
    const isConditional = [
      TradeExecutionType.StopLimit,
      TradeExecutionType.StopMarket
    ].includes(formValues.value[TradeField.TradingType])

    if (isConditional) {
      return false
    }

    const quantity = new BigNumberInBase(
      formValues.value[TradeField.BaseAmount] || 0
    )

    if (
      executionPrice.value.lte(0) ||
      lastTradedPrice.value.lte(0) ||
      quantity.lte(0) ||
      orderTypeReduceOnly.value
    ) {
      return false
    }

    const deviationPrice = isBuy.value
      ? lastTradedPrice.value.div(executionPrice.value)
      : executionPrice.value.div(lastTradedPrice.value)
    const deviation = new BigNumberInBase(1).minus(deviationPrice).times(100)

    return deviation.gt(DEFAULT_PRICE_WARNING_DEVIATION)
  })

  const availableBalanceError = computed(
    () =>
      !orderTypeReduceOnly.value &&
      quoteAvailableBalance.value.lt(notionalWithLeverageAndFees.value)
  )

  const initialMinMarginRequirementError = computed(() => {
    const hasTriggerPrice = new BigNumberInBase(
      formValues.value[TradeField.TriggerPrice] || 0
    ).gt(0)

    if (!formValues.value[TradeField.BaseAmount]) {
      return undefined
    }

    if (executionPrice.value.isNaN() && !tradingTypeStopMarket.value) {
      return undefined
    }

    if (!hasTriggerPrice && tradingTypeStopMarket.value) {
      return undefined
    }

    if (market.value.subType === MarketType.BinaryOptions) {
      return
    }

    if (excludedPriceDeviationSlugs.includes(market.value.ticker)) {
      return undefined
    }

    const initialMarginRatio = (
      market.value as
        | UiPerpetualMarketWithToken
        | UiExpiryFuturesMarketWithToken
    ).initialMarginRatio

    const price = tradingTypeStopMarket.value
      ? worstPriceWithSlippage.value
      : executionPrice.value

    const notionalValueWithMarginRatio = price
      .times(formValues.value[TradeField.BaseAmount] || ZERO_IN_BASE)
      .times(initialMarginRatio)

    if (notionalWithLeverage.value.lte(notionalValueWithMarginRatio)) {
      return true
    }

    return undefined
  })

  const markPriceThresholdError = computed(() => {
    if (
      !markPrice.value ||
      !market.value ||
      !executionPrice.value.gt(0) ||
      !formValues.value[TradeField.BaseAmount] ||
      !worstPriceWithSlippage.value
    ) {
      return undefined
    }

    if (excludedPriceDeviationSlugs.includes(market.value.ticker)) {
      return undefined
    }

    if (market.value.subType === MarketType.BinaryOptions) {
      return undefined
    }

    const useExecutionPrice =
      !tradingTypeMarket.value && !tradingTypeStopMarket.value
    const price = useExecutionPrice
      ? executionPrice.value
      : worstPriceWithSlippage.value
    const notionalWithLeverageBasedOnMarketType = useExecutionPrice
      ? notionalWithLeverage.value
      : notionalWithLeverageBasedOnWorstPrice.value

    const marketWithType = market.value as
      | UiPerpetualMarketWithToken
      | UiExpiryFuturesMarketWithToken

    const markPriceInBigNumber = new BigNumberInBase(markPrice.value)

    if (markPriceInBigNumber.lte(0)) {
      return true
    }

    const notional = price.times(
      formValues.value[TradeField.BaseAmount] || ZERO_IN_BASE
    )

    const notionalBasedOnOrderSide = isBuy.value
      ? notionalWithLeverageBasedOnMarketType.minus(notional)
      : notionalWithLeverageBasedOnMarketType.plus(notional)
    const marginRatio = isBuy.value
      ? new BigNumberInBase(marketWithType.initialMarginRatio).minus(1)
      : new BigNumberInBase(1).plus(marketWithType.initialMarginRatio)
    const amountWithInitialMarginRatio = marginRatio.times(
      formValues.value[TradeField.BaseAmount] || ZERO_IN_BASE
    )
    const priceBasedOnNotionalAndMarginRatio = notionalBasedOnOrderSide.div(
      amountWithInitialMarginRatio
    )

    const isConditionalMarketOrder =
      TradeExecutionType.StopMarket === formValues.value[TradeField.TradingType]

    const triggerPrice = new BigNumberInBase(
      formValues.value[TradeField.TriggerPrice]
    )

    const priceLessThanMarginRatioBasedPrice = isConditionalMarketOrder
      ? markPriceInBigNumber.lt(priceBasedOnNotionalAndMarginRatio) ||
        triggerPrice.lt(priceBasedOnNotionalAndMarginRatio)
      : markPriceInBigNumber.lt(priceBasedOnNotionalAndMarginRatio)

    const priceGreaterThanMarginRatioBasedPrice = isConditionalMarketOrder
      ? markPriceInBigNumber.gt(priceBasedOnNotionalAndMarginRatio) ||
        triggerPrice.gt(priceBasedOnNotionalAndMarginRatio)
      : markPriceInBigNumber.gt(priceBasedOnNotionalAndMarginRatio)

    const isBuyPriceLessThanMarginBasedPrice =
      isBuy.value && priceLessThanMarginRatioBasedPrice
    const isSellPriceGreaterThanMarginBasedPrice =
      !isBuy.value && priceGreaterThanMarginRatioBasedPrice

    return (
      isBuyPriceLessThanMarginBasedPrice ||
      isSellPriceGreaterThanMarginBasedPrice
    )
  })

  const orderbookOrders = computed(
    () =>
      (isBuy.value
        ? derivativeStore.sells
        : derivativeStore.buys) as UiPriceLevel[]
  )

  const filteredConditionalOrders = computed(() =>
    derivativeStore.subaccountConditionalOrders.filter((order) => {
      const orderType = isBuy.value ? OrderSide.Buy : OrderSide.Sell

      return (
        order.direction === orderType &&
        order.marketId === market.value.marketId
      )
    })
  )

  const maxOrdersError = computed(() => {
    const filteredOrders = [
      orderbookOrders.value,
      ...filteredConditionalOrders.value
    ]

    return (
      !tradingTypeMarket.value &&
      filteredOrders.length >= UI_DEFAULT_MAX_NUMBER_OF_ORDERS
    )
  })

  return {
    highDeviation,
    maxOrdersError,
    availableBalanceError,
    markPriceThresholdError,
    initialMinMarginRequirementError
  }
}
