import type { Ref } from 'vue'
import {
  MarketType,
  UiPerpetualMarketWithToken,
  UiExpiryFuturesMarketWithToken,
  UiDerivativeMarketWithToken,
  UiPriceLevel,
  DerivativeOrderSide,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { TradeExecutionType, TradeField, TradeForm } from '@/types'
import { excludedPriceDeviationSlugs } from '@/app/data/market'
import { UI_DEFAULT_MAX_NUMBER_OF_ORDERS } from '@/app/utils/constants'

const DEFAULT_MARKET_PRICE_WARNING_DEVIATION = 10

export function useDerivativeError({
  executionPrice,
  formValues,
  isBuy,
  market,
  notionalWithLeverage,
  notionalWithLeverageBasedOnWorstPrice,
  notionalWithLeverageAndFees,
  orderTypeReduceOnly,
  quoteAvailableBalance,
  worstPriceWithSlippage
}: {
  executionPrice: Ref<BigNumberInBase>
  formValues: Ref<TradeForm>
  isBuy: Ref<boolean>
  market: Ref<UiDerivativeMarketWithToken>
  notionalWithLeverage: Ref<BigNumberInBase>
  notionalWithLeverageBasedOnWorstPrice: Ref<BigNumberInBase>
  notionalWithLeverageAndFees: Ref<BigNumberInBase>
  orderTypeReduceOnly: Ref<BigNumberInBase>
  quoteAvailableBalance: Ref<BigNumberInBase>
  worstPriceWithSlippage: Ref<BigNumberInBase>
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

    return deviation.gt(DEFAULT_MARKET_PRICE_WARNING_DEVIATION)
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

    const price = tradingTypeStopMarket
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
      !derivativeStore.marketMarkPrice ||
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

    const markPrice = new BigNumberInBase(derivativeStore.marketMarkPrice)

    if (markPrice.lte(0)) {
      return true
    }

    const notional = price.times(
      formValues.value[TradeField.BaseAmount] || ZERO_IN_BASE
    )

    const notionalBasedOnOrderType = isBuy.value
      ? notionalWithLeverageBasedOnMarketType.minus(notional)
      : notionalWithLeverageBasedOnMarketType.plus(notional)
    const marginRatio = isBuy.value
      ? new BigNumberInBase(marketWithType.initialMarginRatio).minus(1)
      : new BigNumberInBase(1).plus(marketWithType.initialMarginRatio)
    const amountWithInitialMarginRatio = marginRatio.times(
      formValues.value[TradeField.BaseAmount] || ZERO_IN_BASE
    )
    const priceBasedOnNotionalAndMarginRatio = notionalBasedOnOrderType.div(
      amountWithInitialMarginRatio
    )

    const isConditional = [
      TradeExecutionType.StopLimit,
      TradeExecutionType.StopMarket
    ].includes(formValues.value[TradeField.TradingType])

    const triggerPrice = new BigNumberInBase(
      formValues.value[TradeField.TriggerPrice]
    )

    const priceLessThanMarginRatioBasedPrice = isConditional
      ? markPrice.lt(priceBasedOnNotionalAndMarginRatio) ||
        triggerPrice.lt(priceBasedOnNotionalAndMarginRatio)
      : markPrice.lt(priceBasedOnNotionalAndMarginRatio)

    const priceGreaterThanMarginRatioBasedPrice = isConditional
      ? markPrice.gt(priceBasedOnNotionalAndMarginRatio) ||
        triggerPrice.gt(priceBasedOnNotionalAndMarginRatio)
      : markPrice.gt(priceBasedOnNotionalAndMarginRatio)

    const isBuyPriceLessThanMarginBasedPrice =
      isBuy.value && priceLessThanMarginRatioBasedPrice
    const isSellPriceGreaterThanMarginBasedPrice =
      !isBuy.value && priceGreaterThanMarginRatioBasedPrice

    return (
      isBuyPriceLessThanMarginBasedPrice ||
      isSellPriceGreaterThanMarginBasedPrice
    )
  })

  const orderbookOrders = computed<UiPriceLevel[] | undefined>(() =>
    isBuy.value
      ? derivativeStore.orderbook?.sells
      : derivativeStore.orderbook?.buys
  )

  const filteredConditionalOrders = computed(() =>
    derivativeStore.subaccountConditionalOrders.filter((order) => {
      const orderType = isBuy.value
        ? DerivativeOrderSide.Buy
        : DerivativeOrderSide.Sell

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
    availableBalanceError,
    highDeviation,
    initialMinMarginRequirementError,
    markPriceThresholdError,
    maxOrdersError
  }
}
