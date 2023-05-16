<script lang="ts" setup>
import { PropType } from 'vue'
import {
  Status,
  StatusType,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import {
  MarketType,
  ZERO_IN_BASE,
  UiPerpetualMarketWithToken,
  UiDerivativeMarketWithToken,
  UiExpiryFuturesMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { TradeDirection, OrderSide, OrderState } from '@injectivelabs/ts-types'
import {
  Modal,
  TradeForm,
  TradeField,
  TradeExecutionType,
  OrderAttemptStatus
} from '@/types'
import {
  DEBUG_CALCULATION,
  TRADE_FORM_PRICE_ROUNDING_MODE
} from '@/app/utils/constants'
import {
  calculateMargin,
  calculateLiquidationPrice,
  calculateBinaryOptionsMargin
} from '@/app/client/utils/derivatives'
import { amplitudeTradeTracker } from '@/app/providers/amplitude'

const appStore = useAppStore()
const modalStore = useModalStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { success } = useNotifications()
const { t } = useLang()
const { $onError } = useNuxtApp()

const {
  meta: formMeta,
  values: formValues,
  resetForm: resetFormValues
} = useForm<TradeForm>()

const isBaseAmount = ref(true)
const status = reactive(new Status(StatusType.Idle))

const props = defineProps({
  market: {
    type: Object as PropType<UiDerivativeMarketWithToken>,
    required: true
  }
})

const {
  baseAmount,
  limitPrice,
  triggerPrice,
  hasBaseAmount,
  hasTriggerPrice,
  tradingTypeLimit,
  tradingTypeMarket,
  isConditionalOrder,
  tradingTypeStopLimit,
  tradingTypeStopMarket
} = useDerivativeFormFormatter(computed(() => formValues))

const { makerFeeRate, takerFeeRate } = useTradeFee(computed(() => props.market))
const { markPrice, lastTradedPrice } = useDerivativeLastPrice(
  computed(() => props.market)
)

const { accountBalancesWithToken } = useBalance()

const isBuy = computed(() => formValues[TradeField.OrderSide] === OrderSide.Buy)

const orderTypeToSubmit = computed(() => {
  if (tradingTypeStopLimit.value || tradingTypeStopMarket.value) {
    const triggerPriceInBase = triggerPrice.value || ZERO_IN_BASE

    return isBuy.value
      ? triggerPriceInBase.lt(markPrice.value)
        ? OrderSide.TakeBuy
        : OrderSide.StopBuy
      : triggerPriceInBase.gt(markPrice.value)
      ? OrderSide.TakeSell
      : OrderSide.StopSell
  }

  switch (true) {
    case formValues[TradeField.PostOnly] && isBuy.value:
      return OrderSide.BuyPO
    case isBuy.value:
      return OrderSide.Buy
    case formValues[TradeField.PostOnly] && !isBuy.value:
      return OrderSide.SellPO
    case !isBuy.value:
      return OrderSide.Sell
    default:
      return OrderSide.Buy
  }
})

const {
  slippage,
  maxReduceOnly,
  maxAmountOnOrderbook,
  updateAmountFromBase,
  worstPriceWithSlippage
} = useDerivativePrice({
  isBaseAmount,
  market: computed(() => props.market),
  formValues: computed(() => formValues)
})

const showReduceOnly = computed(() => {
  if (isConditionalOrder.value) {
    const hasOpenOrder = derivativeStore.subaccountOrders.some(
      (order) =>
        order.marketId === props.market.marketId &&
        [
          OrderState.PartialFilled,
          OrderState.Unfilled,
          OrderState.Booked
        ].includes(order.state)
    )

    return !!position.value || hasOpenOrder
  }

  if (!position.value) {
    return false
  }

  const longAndBuy =
    position.value.direction === TradeDirection.Long && isBuy.value

  const shortAndSell =
    position.value.direction === TradeDirection.Short && !isBuy.value

  return !(longAndBuy || shortAndSell)
})

const orderTypeReduceOnly = computed(
  () => formValues[TradeField.ReduceOnly] && showReduceOnly.value
)

const position = computed(() => {
  if (positionStore.subaccountPositions.length === 0) {
    return
  }

  return positionStore.subaccountPositions.find(
    (position) => position.marketId === props.market.marketId
  )
})

const quoteAvailableBalance = computed(() => {
  const quoteBalance = accountBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.quoteDenom
  )

  return new BigNumberInWei(quoteBalance?.availableMargin || '0').toBase(
    props.market.quoteToken.decimals
  )
})

const feeRate = computed(() => {
  if (formValues[TradeField.PostOnly] && !tradingTypeMarket.value) {
    return makerFeeRate.value
  }

  return takerFeeRate.value
})

const executionPrice = computed(() => {
  return tradingTypeMarket.value || tradingTypeStopMarket.value
    ? worstPriceWithSlippage.value
    : limitPrice.value
})

const hasExecutionPrice = computed(() => executionPrice.value.gt(0))

const notionalWithLeverage = computed(() => {
  if (!hasBaseAmount.value) {
    return ZERO_IN_BASE
  }

  if (!hasExecutionPrice.value && !tradingTypeStopMarket.value) {
    return ZERO_IN_BASE
  }

  if (!triggerPrice.value && tradingTypeStopMarket.value) {
    return ZERO_IN_BASE
  }

  const price =
    tradingTypeMarket.value || tradingTypeStopMarket.value
      ? worstPriceWithSlippage.value.toFixed()
      : executionPrice.value.toFixed()

  if (props.market.subType === MarketType.BinaryOptions) {
    return new BigNumberInBase(
      calculateBinaryOptionsMargin({
        price,
        orderSide: formValues[TradeField.OrderSide],
        quantity: formValues[TradeField.BaseAmount],
        quoteTokenDecimals: props.market.quoteToken.decimals,
        tensMultiplier: props.market.quantityTensMultiplier
      }).toFixed()
    )
  }

  return new BigNumberInBase(
    calculateMargin({
      price,
      quantity: formValues[TradeField.BaseAmount],
      quoteTokenDecimals: props.market.quoteToken.decimals,
      tensMultiplier: props.market.quantityTensMultiplier,
      leverage: formValues[TradeField.Leverage]
    }).toFixed()
  )
})

const notionalWithLeverageBasedOnWorstPrice = computed(() => {
  if (!hasBaseAmount.value) {
    return ZERO_IN_BASE
  }

  if (!hasExecutionPrice.value && !tradingTypeStopMarket.value) {
    return ZERO_IN_BASE
  }

  if (!triggerPrice.value && tradingTypeStopMarket.value) {
    return ZERO_IN_BASE
  }

  if (props.market.subType === MarketType.BinaryOptions) {
    return new BigNumberInBase(
      calculateBinaryOptionsMargin({
        price: worstPriceWithSlippage.value.toFixed(),
        orderSide: formValues[TradeField.OrderSide],
        quantity: formValues[TradeField.BaseAmount],
        quoteTokenDecimals: props.market.quoteToken.decimals,
        tensMultiplier: props.market.quantityTensMultiplier
      }).toFixed()
    )
  }

  return new BigNumberInBase(
    calculateMargin({
      price: worstPriceWithSlippage.value.toFixed(),
      leverage: formValues[TradeField.Leverage],
      quantity: formValues[TradeField.BaseAmount],
      quoteTokenDecimals: props.market.quoteToken.decimals,
      tensMultiplier: props.market.quantityTensMultiplier
    }).toFixed()
  )
})

const notionalValue = computed(() => {
  if (baseAmount.value.isNaN()) {
    return ZERO_IN_BASE
  }

  const price =
    tradingTypeMarket.value || tradingTypeStopMarket.value
      ? worstPriceWithSlippage.value.toFixed()
      : executionPrice.value.toFixed()

  const notional = baseAmount.value.times(price)

  if (notional.lt(0)) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(notional)
})

const fees = computed(() => {
  if (notionalValue.value.isNaN()) {
    return ZERO_IN_BASE
  }

  return notionalValue.value.times(feeRate.value)
})

const notionalWithLeverageToBigNumber = computed(() => {
  if (!hasBaseAmount.value) {
    return ZERO_IN_BASE
  }

  if (!hasExecutionPrice.value && !tradingTypeStopMarket.value) {
    return ZERO_IN_BASE
  }

  if (!triggerPrice.value && tradingTypeStopMarket.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(notionalWithLeverage.value)
})

const notionalWithLeverageAndFees = computed(() => {
  if (
    notionalWithLeverageToBigNumber.value.isNaN() ||
    notionalWithLeverageToBigNumber.value.lte(0)
  ) {
    return ZERO_IN_BASE
  }

  return fees.value.plus(notionalWithLeverageToBigNumber.value)
})

const liquidationPrice = computed(() => {
  if (!hasBaseAmount.value) {
    return ZERO_IN_BASE
  }

  if (!hasExecutionPrice.value && !tradingTypeStopMarket.value) {
    return ZERO_IN_BASE
  }

  if (!triggerPrice.value && tradingTypeStopMarket.value) {
    return ZERO_IN_BASE
  }

  if (props.market.subType === MarketType.BinaryOptions) {
    return ZERO_IN_BASE
  }

  const derivativeMarket = props.market as
    | UiPerpetualMarketWithToken
    | UiExpiryFuturesMarketWithToken

  const price =
    tradingTypeMarket.value || tradingTypeStopMarket.value
      ? worstPriceWithSlippage.value.toFixed()
      : executionPrice.value.toFixed()

  return calculateLiquidationPrice({
    price,
    market: derivativeMarket,
    quantity: formValues[TradeField.BaseAmount],
    orderType: formValues[TradeField.OrderSide],
    notionalWithLeverage: notionalWithLeverage.value.toFixed()
  })
})

const {
  highDeviation,
  maxOrdersError,
  availableBalanceError,
  markPriceThresholdError,
  initialMinMarginRequirementError
} = useDerivativeError({
  isBuy,
  markPrice,
  executionPrice,
  orderTypeReduceOnly,
  notionalWithLeverage,
  quoteAvailableBalance,
  worstPriceWithSlippage,
  notionalWithLeverageAndFees,
  notionalWithLeverageBasedOnWorstPrice,
  formValues: computed(() => formValues),
  market: computed(() => props.market as UiDerivativeMarketWithToken)
})

watch(executionPrice, () => {
  if (maxAmountOnOrderbook.value.totalQuantity.eq(0)) {
    return
  }

  updateAmount({ isBaseAmount: isBaseAmount.value })
})

watch(
  () => lastTradedPrice.value,
  (newPrice: BigNumberInBase) => {
    if (tradingTypeStopLimit.value) {
      return
    }

    const hasNoInputPrice =
      !hasExecutionPrice.value || executionPrice.value.lte(0)
    const hasLatestLastTradedPrice = newPrice.gt('0')

    if (hasNoInputPrice && hasLatestLastTradedPrice) {
      const formattedPrice = newPrice.toFixed(
        props.market.priceDecimals,
        TRADE_FORM_PRICE_ROUNDING_MODE
      )

      formValues[TradeField.LimitPrice] = formattedPrice
    }
  },
  { immediate: true }
)

function updateAmount({
  amount,
  isBaseAmount: isBaseAmountUpdate
}: {
  amount?: string
  isBaseAmount: boolean
}) {
  isBaseAmount.value = isBaseAmountUpdate

  const amountToUpdate = updateAmountFromBase({
    amount,
    isBaseAmount: isBaseAmountUpdate
  })

  if (amountToUpdate) {
    formValues[
      isBaseAmountUpdate ? TradeField.QuoteAmount : TradeField.BaseAmount
    ] = amountToUpdate
  }
}

function submitLimitOrder() {
  status.setLoading()

  derivativeStore
    .submitLimitOrder({
      market: props.market,
      price: limitPrice.value,
      quantity: baseAmount.value,
      margin: notionalWithLeverage.value,
      orderSide: orderTypeToSubmit.value,
      reduceOnly: orderTypeReduceOnly.value
    })
    .then(() => {
      handleAttemptPlaceOrderTrack()
      success({ title: t('trade.order_placed') })
      resetForm()
    })
    .catch((e) => {
      handleAttemptPlaceOrderTrack(e.message)
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

function submitStopLimitOrder() {
  if (!triggerPrice.value) {
    return
  }

  status.setLoading()

  derivativeStore
    .submitStopLimitOrder({
      market: props.market,
      price: limitPrice.value,
      quantity: baseAmount.value,
      triggerPrice: triggerPrice.value,
      margin: notionalWithLeverage.value,
      orderSide: orderTypeToSubmit.value,
      reduceOnly: orderTypeReduceOnly.value
    })
    .then(() => {
      handleAttemptPlaceOrderTrack()
      success({ title: t('trade.order_placed') })
      resetFormValues()
    })
    .catch((e) => {
      handleAttemptPlaceOrderTrack(e)
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

function submitMarketOrder() {
  status.setLoading()

  derivativeStore
    .submitMarketOrder({
      market: props.market,
      quantity: baseAmount.value,
      price: worstPriceWithSlippage.value,
      reduceOnly: orderTypeReduceOnly.value,
      orderSide: formValues[TradeField.OrderSide],
      margin: notionalWithLeverageBasedOnWorstPrice.value
    })
    .then(() => {
      handleAttemptPlaceOrderTrack()
      success({ title: t('trade.order_placed') })
      resetForm()
    })
    .catch((e) => {
      handleAttemptPlaceOrderTrack(e)
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

function submitStopMarketOrder() {
  if (!triggerPrice.value) {
    return
  }

  status.setLoading()

  derivativeStore
    .submitStopMarketOrder({
      market: props.market,
      quantity: baseAmount.value,
      triggerPrice: triggerPrice.value,
      orderSide: orderTypeToSubmit.value,
      price: worstPriceWithSlippage.value,
      reduceOnly: orderTypeReduceOnly.value,
      margin: notionalWithLeverageBasedOnWorstPrice.value
    })
    .then(() => {
      handleAttemptPlaceOrderTrack()
      success({ title: t('trade.order_placed') })
      resetForm()
    })
    .catch((e) => {
      handleAttemptPlaceOrderTrack(e)
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

function resetForm() {
  resetFormValues({
    values: {
      ...formMeta.value.initialValues,
      [TradeField.ReduceOnly]: false,
      [TradeField.OrderSide]: formValues[TradeField.OrderSide],
      [TradeField.TradingType]: formValues[TradeField.TradingType],
      [TradeField.LimitPrice]: lastTradedPrice.value.toFixed(
        props.market.priceDecimals,
        TRADE_FORM_PRICE_ROUNDING_MODE
      )
    } as TradeForm
  })
}

function handleRequestSubmit() {
  if (highDeviation.value) {
    return modalStore.openModal({
      type: Modal.PriceDeviation
    })
  }

  if (
    appStore.userState.skipTradeConfirmationModal ||
    tradingTypeMarket.value ||
    tradingTypeLimit.value
  ) {
    return handleSubmit()
  }

  if (
    !triggerPrice.value ||
    (tradingTypeStopLimit.value && !limitPrice.value)
  ) {
    return
  }

  return modalStore.openModal({
    type: Modal.OrderConfirm
  })
}

function handleSubmit() {
  switch (formValues[TradeField.TradingType]) {
    case TradeExecutionType.LimitFill:
      return submitLimitOrder()
    case TradeExecutionType.Market:
      return submitMarketOrder()
    case 'stopLimit':
      return submitStopLimitOrder()
    case 'stopMarket':
      return submitStopMarketOrder()
  }
}

function handleAttemptPlaceOrderTrack(errorMessage?: string) {
  const slippageTolerance = tradingTypeMarket.value
    ? formValues[TradeField.SlippageTolerance]
    : ''
  const postOnly = tradingTypeLimit.value && formValues[TradeField.PostOnly]
  const status = errorMessage
    ? OrderAttemptStatus.Error
    : OrderAttemptStatus.Success

  amplitudeTradeTracker.submitPlaceOrderConfirmTrackEvent({
    status,
    postOnly,
    slippageTolerance,
    error: errorMessage,
    market: props.market.slug,
    marketType: props.market.subType,
    amount: formValues[TradeField.BaseAmount],
    leverage: formValues[TradeField.Leverage],
    orderSide: formValues[TradeField.OrderSide],
    reduceOnly: formValues[TradeField.ReduceOnly],
    limitPrice: formValues[TradeField.LimitPrice],
    tradingType: formValues[TradeField.TradingType],
    triggerPrice: formValues[TradeField.TriggerPrice]
  })
}
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <PartialsTradingFormTradeExecutionTypeButtons @form:reset="resetForm" />

    <PartialsTradingFormOrderSideSelect v-bind="{ market }" />

    <PartialsTradingFormOrderInputs
      v-bind="{
        fees,
        isBuy,
        market,
        feeRate,
        position,
        isBaseAmount,
        maxReduceOnly,
        executionPrice,
        showReduceOnly,
        lastTradedPrice,
        orderTypeReduceOnly,
        maxAmountOnOrderbook,
        availableBalanceError,
        quoteAvailableBalance,
        worstPriceWithSlippage,
        markPriceThresholdError,
        initialMinMarginRequirementError
      }"
      @update:amount="updateAmount"
    />

    <PartialsTradingFormDebug
      v-if="DEBUG_CALCULATION"
      v-bind="{
        fees,
        isBuy,
        market,
        feeRate,
        isBaseAmount,
        liquidationPrice,
        notionalValue: notionalWithLeverage,
        notionalWithFees: notionalWithLeverageAndFees
      }"
    />

    <PartialsTradingOrderDetails
      :key="formValues[TradeField.TradingType]"
      v-bind="{
        fees,
        isBuy,
        market,
        feeRate,
        slippage,
        formValues,
        executionPrice,
        liquidationPrice,
        orderTypeReduceOnly,
        notionalValue: notionalWithLeverage,
        notionalWithFees: notionalWithLeverageAndFees
      }"
    />

    <PartialsTradingFormOrderSubmit
      v-bind="{
        isBuy,
        status,
        market,
        hasBaseAmount,
        highDeviation,
        executionPrice,
        maxOrdersError,
        hasTriggerPrice,
        orderTypeReduceOnly,
        availableBalanceError,
        markPriceThresholdError,
        initialMinMarginRequirementError
      }"
      @submit:request="handleRequestSubmit"
    />

    <ModalsOrderConfirmDerivative
      v-bind="{
        market,
        triggerPrice,
        amount: baseAmount,
        orderType: orderTypeToSubmit,
        isReduceOnly: formValues[TradeField.ReduceOnly],
        tradingType: formValues[TradeField.TradingType],
        price: tradingTypeStopLimit ? limitPrice : undefined
      }"
      @order:confirmed="handleSubmit"
    />

    <ModalsPriceDeviation @order:confirmed="handleSubmit" />
  </div>
</template>
