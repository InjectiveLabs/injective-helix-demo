<script lang="ts" setup>
import { PropType } from 'vue'
import {
  Status,
  StatusType,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import {
  DerivativeOrderSide,
  MarketType,
  UiDerivativeMarketWithToken,
  UiExpiryFuturesMarketWithToken,
  UiPerpetualMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import { DerivativeOrderState } from '@injectivelabs/sdk-ts'
import {
  Modal,
  OrderAttemptStatus,
  TradeField,
  TradeForm,
  TradeFormValue,
  TradeExecutionType
} from '@/types'
import {
  DEBUG_CALCULATION,
  TRADE_FORM_PRICE_ROUNDING_MODE,
  TRADE_FORM_QUANTITY_ROUNDING_MODE
} from '@/app/utils/constants'
import {
  calculateLiquidationPrice,
  calculateMargin,
  calculateBinaryOptionsMargin
} from '@/app/client/utils/derivatives'
import { amplitudeTracker } from '@/app/providers/AmplitudeTracker'

const appStore = useAppStore()
const accountStore = useAccountStore()
const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const modalStore = useModalStore()
const { success } = useNotifications()
const { t } = useLang()
const { $onError } = useNuxtApp()

const {
  values,
  setFieldValue,
  errors: formErrors,
  resetForm: resetFormValues
} = useForm<TradeForm>()

const defaultStep = '1'
const isBase = ref(true)
const status = reactive(new Status(StatusType.Idle))

const formValues = computed(() => values)

const props = defineProps({
  market: {
    type: Object as PropType<UiDerivativeMarketWithToken>,
    required: true
  }
})

const {
  baseAmount,
  hasBaseAmount,
  isConditionalOrder,
  limitPrice,
  tradingTypeLimit,
  tradingTypeMarket,
  tradingTypeStopLimit,
  tradingTypeStopMarket,
  triggerPrice,
  hasTriggerPrice
} = useDerivativeFormFormatter(formValues)

const { makerFeeRate, takerFeeRate } = useTradeFee(computed(() => props.market))

const amountStep = computed(() => {
  return props.market
    ? new BigNumberInBase(1)
        .shiftedBy(props.market.quantityTensMultiplier)
        .toFixed()
    : defaultStep
})

const priceStep = computed(() => {
  return props.market
    ? new BigNumberInBase(1).shiftedBy(-props.market.priceDecimals).toFixed()
    : defaultStep
})

const isBuy = computed(
  () => formValues.value[TradeField.OrderType] === DerivativeOrderSide.Buy
)

const orderTypeToSubmit = computed(() => {
  if (tradingTypeStopLimit.value || tradingTypeStopMarket.value) {
    const triggerPriceInBase = triggerPrice.value || ZERO_IN_BASE

    return isBuy.value
      ? triggerPriceInBase.lt(derivativeStore.marketMarkPrice)
        ? DerivativeOrderSide.TakeBuy
        : DerivativeOrderSide.StopBuy
      : triggerPriceInBase.gt(derivativeStore.marketMarkPrice)
      ? DerivativeOrderSide.TakeSell
      : DerivativeOrderSide.StopSell
  }

  switch (true) {
    case formValues.value[TradeField.PostOnly] && isBuy.value: {
      return DerivativeOrderSide.BuyPO
    }
    case isBuy.value: {
      return DerivativeOrderSide.Buy
    }
    case formValues.value[TradeField.PostOnly] && !isBuy.value: {
      return DerivativeOrderSide.SellPO
    }
    case !isBuy.value: {
      return DerivativeOrderSide.Sell
    }
    default: {
      return DerivativeOrderSide.Buy
    }
  }
})

const { lastTradedPrice } = useDerivativeLastPriceFormatter(
  props.market,
  computed(() => derivativeStore.trades || [])
)

const {
  maxAmountOnOrderbook,
  maxReduceOnly,
  slippage,
  worstPriceWithSlippage
} = useDerivativePrice({
  formValues,
  isBase,
  market: computed(() => props.market)
})

const showReduceOnly = computed(() => {
  if (isConditionalOrder.value) {
    const hasOpenOrder = derivativeStore.subaccountOrders.some(
      (order) =>
        order.marketId === props.market.marketId &&
        [
          DerivativeOrderState.PartialFilled,
          DerivativeOrderState.Unfilled,
          DerivativeOrderState.Booked
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
  () => formValues.value[TradeField.ReduceOnly] && showReduceOnly.value
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
  if (!accountStore.subaccount) {
    return ZERO_IN_BASE
  }

  const balance = accountStore.subaccount.balances.find(
    (balance) =>
      balance.denom.toLowerCase() === props.market!.quoteDenom.toLowerCase()
  )

  if (!balance) {
    return ZERO_IN_BASE
  }

  const quoteAvailableBalance = new BigNumberInWei(
    balance.availableBalance || 0
  ).toBase(props.market.quoteToken.decimals)

  if (quoteAvailableBalance.isNaN()) {
    return ZERO_IN_BASE
  }

  return quoteAvailableBalance
})

const feeRate = computed(() => {
  if (formValues.value[TradeField.PostOnly] && !tradingTypeMarket.value) {
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
        orderSide: formValues.value[TradeField.OrderType],
        quantity: formValues.value[TradeField.BaseAmount],
        tensMultiplier: props.market.priceTensMultiplier
      }).toFixed()
    )
  }

  return new BigNumberInBase(
    calculateMargin({
      price,
      quantity: formValues.value[TradeField.BaseAmount],
      tensMultiplier: props.market.priceTensMultiplier,
      leverage: formValues.value[TradeField.Leverage]
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
        orderSide: formValues.value[TradeField.OrderType],
        quantity: formValues.value[TradeField.BaseAmount],
        price: worstPriceWithSlippage.value.toFixed(),
        tensMultiplier: props.market.priceTensMultiplier
      }).toFixed()
    )
  }

  return new BigNumberInBase(
    calculateMargin({
      quantity: formValues.value[TradeField.BaseAmount],
      price: worstPriceWithSlippage.value.toFixed(),
      leverage: formValues.value[TradeField.Leverage],
      tensMultiplier: props.market.priceTensMultiplier
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
    market: derivativeMarket,
    orderType: formValues.value[TradeField.OrderType],
    notionalWithLeverage: notionalWithLeverage.value.toFixed(),
    price,
    quantity: formValues.value[TradeField.BaseAmount]
  })
})

const {
  availableBalanceError,
  highDeviation,
  initialMinMarginRequirementError,
  markPriceThresholdError,
  maxOrdersError
} = useDerivativeError({
  executionPrice,
  formValues,
  isBuy,
  notionalWithLeverage,
  notionalWithLeverageBasedOnWorstPrice,
  notionalWithLeverageAndFees,
  orderTypeReduceOnly,
  quoteAvailableBalance,
  worstPriceWithSlippage,
  market: computed(() => props.market as UiDerivativeMarketWithToken)
})

watch(executionPrice, () => {
  if (maxAmountOnOrderbook.value.totalQuantity.eq(0)) {
    return
  }

  updateAmount({ isBase: isBase.value })
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

      updateFormValue({ field: TradeField.LimitPrice, value: formattedPrice })
    }
  },
  { immediate: true }
)

function updateFormValue({ field, value }: TradeFormValue) {
  setFieldValue(field, value)
}

function updateAmount({
  amount,
  isBase: isBaseUpdate
}: {
  amount?: string
  isBase: boolean
}) {
  isBase.value = isBaseUpdate

  const price = tradingTypeStopMarket.value
    ? triggerPrice.value || ZERO_IN_BASE
    : executionPrice.value

  if (isBaseUpdate) {
    const updatedQuoteAmount = new BigNumberInBase(
      amount ?? formValues.value[TradeField.BaseAmount]
    ).times(price)

    if (updatedQuoteAmount.isNaN()) {
      return
    }

    const updatedQuoteAmountToString = updatedQuoteAmount.toFixed(
      props.market.priceDecimals,
      TRADE_FORM_QUANTITY_ROUNDING_MODE
    )

    if (!updatedQuoteAmountToString) {
      return
    }

    const tradingTypeStopLimitAndTriggerPriceExists =
      !tradingTypeStopLimit.value ||
      new BigNumberInBase(formValues.value[TradeField.TriggerPrice]).gt(0)

    if (tradingTypeStopLimitAndTriggerPriceExists) {
      updateFormValue({
        field: TradeField.QuoteAmount,
        value: updatedQuoteAmountToString
      })
    }
  } else {
    const baseAmountFromPrice = new BigNumberInBase(
      amount ?? formValues.value[TradeField.QuoteAmount]
    ).dividedBy(price)

    if (baseAmountFromPrice.isNaN() || baseAmountFromPrice.lte(0)) {
      return
    }

    const updatedBaseAmountToString = baseAmountFromPrice.toFixed(
      props.market.quantityDecimals,
      TRADE_FORM_QUANTITY_ROUNDING_MODE
    )

    if (!updatedBaseAmountToString) {
      return
    }

    updateFormValue({
      field: TradeField.BaseAmount,
      value: updatedBaseAmountToString
    })
  }
}

function submitLimitOrder() {
  status.setLoading()

  derivativeStore
    .submitLimitOrder({
      price: limitPrice.value,
      margin: notionalWithLeverage.value,
      orderType: orderTypeToSubmit.value,
      reduceOnly: orderTypeReduceOnly.value,
      quantity: baseAmount.value,
      market: props.market
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

function submitStopLimitOrder() {
  if (!triggerPrice.value) {
    return
  }

  status.setLoading()

  derivativeStore
    .submitStopLimitOrder({
      price: limitPrice.value,
      triggerPrice: triggerPrice.value,
      margin: notionalWithLeverage.value,
      orderType: orderTypeToSubmit.value,
      reduceOnly: orderTypeReduceOnly.value,
      quantity: baseAmount.value,
      market: props.market
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

function submitMarketOrder() {
  status.setLoading()

  derivativeStore
    .submitMarketOrder({
      orderType: formValues.value[TradeField.OrderType],
      margin: notionalWithLeverageBasedOnWorstPrice.value,
      reduceOnly: orderTypeReduceOnly.value,
      price: worstPriceWithSlippage.value,
      quantity: baseAmount.value,
      market: props.market
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
      orderType: orderTypeToSubmit.value,
      margin: notionalWithLeverageBasedOnWorstPrice.value,
      reduceOnly: orderTypeReduceOnly.value,
      price: worstPriceWithSlippage.value,
      triggerPrice: triggerPrice.value,
      quantity: baseAmount.value,
      market: props.market
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

function setDefaultFormValues() {
  updateFormValue({ field: TradeField.BaseAmount, value: amountStep.value })
  updateFormValue({ field: TradeField.QuoteAmount, value: priceStep.value })
  updateFormValue({
    field: TradeField.LimitPrice,
    value: lastTradedPrice.value.toFixed(
      props.market.priceDecimals,
      TRADE_FORM_PRICE_ROUNDING_MODE
    )
  })
  updateFormValue({
    field: TradeField.ReduceOnly,
    value: false
  })
}

function resetForm() {
  resetFormValues()
  setDefaultFormValues()
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
  switch (formValues.value[TradeField.TradingType]) {
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
    ? formValues.value[TradeField.SlippageTolerance]
    : ''
  const postOnly =
    tradingTypeLimit.value && formValues.value[TradeField.PostOnly]
  const status = errorMessage
    ? OrderAttemptStatus.Error
    : OrderAttemptStatus.Success

  amplitudeTracker.submitAttemptPlaceOrderTrackEvent({
    status,
    postOnly,
    orderType: formValues.value[TradeField.OrderType],
    tradingType: formValues.value[TradeField.TradingType],
    slippageTolerance,
    amount: formValues.value[TradeField.BaseAmount],
    leverage: formValues.value[TradeField.Leverage],
    market: props.market.slug,
    marketType: props.market.subType,
    triggerPrice: formValues.value[TradeField.TriggerPrice],
    reduceOnly: formValues.value[TradeField.ReduceOnly],
    limitPrice: formValues.value[TradeField.LimitPrice],
    error: errorMessage
  })
}
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <PartialsTradingFormTradeExecutionTypeButtons
      v-bind="{ formValues }"
      @form:reset="setDefaultFormValues"
    />

    <PartialsTradingFormOrderTypeSelect
      v-bind="{ formValues, market: props.market }"
      @update:formValue="updateFormValue"
    />

    <PartialsTradingFormOrderInputs
      v-bind="{
        amountStep,
        availableBalanceError,
        executionPrice,
        feeRate,
        fees,
        formErrors,
        formValues,
        initialMinMarginRequirementError,
        isBase,
        isBuy,
        lastTradedPrice,
        market,
        markPriceThresholdError,
        maxAmountOnOrderbook,
        maxReduceOnly,
        orderTypeReduceOnly,
        position,
        priceStep,
        quoteAvailableBalance,
        showReduceOnly,
        worstPriceWithSlippage
      }"
      @update:amount="updateAmount"
      @update:formValue="updateFormValue"
    />

    <PartialsTradingFormDebug
      v-if="DEBUG_CALCULATION"
      v-bind="{
        isBase,
        isBuy,
        fees,
        feeRate,
        formValues,
        market,
        liquidationPrice,
        notionalValue: notionalWithLeverage,
        notionalWithFees: notionalWithLeverageAndFees
      }"
    />

    <PartialsTradingOrderDetails
      :key="formValues[TradeField.TradingType]"
      v-bind="{
        executionPrice,
        feeRate,
        fees,
        formValues,
        isBuy,
        liquidationPrice,
        market,
        orderTypeReduceOnly,
        slippage,
        notionalValue: notionalWithLeverage,
        notionalWithFees: notionalWithLeverageAndFees
      }"
    />

    <PartialsTradingFormOrderSubmit
      v-bind="{
        availableBalanceError,
        executionPrice,
        formErrors,
        formValues,
        hasBaseAmount,
        hasTriggerPrice,
        highDeviation,
        initialMinMarginRequirementError,
        isBuy,
        market,
        markPriceThresholdError,
        maxOrdersError,
        orderTypeReduceOnly,
        status
      }"
      @submit:request="handleRequestSubmit"
    />

    <ModalsOrderConfirmDerivative
      v-bind="{
        isReduceOnly: formValues[TradeField.ReduceOnly],
        amount: baseAmount,
        market: market,
        orderType: orderTypeToSubmit,
        price: tradingTypeStopLimit ? limitPrice : undefined,
        tradingType: formValues[TradeField.TradingType],
        triggerPrice: triggerPrice
      }"
      @confirmed="handleSubmit"
    />

    <ModalsPriceDeviation @confirmed="handleSubmit" />
  </div>
</template>
