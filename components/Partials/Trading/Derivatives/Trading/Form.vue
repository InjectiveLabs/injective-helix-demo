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
  DerivativeOrderSide,
  UiPerpetualMarketWithToken,
  UiDerivativeMarketWithToken,
  UiExpiryFuturesMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import { DerivativeOrderState } from '@injectivelabs/sdk-ts'
import {
  Modal,
  TradeForm,
  TradeField,
  TradeFormValue,
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
import { amplitudeTracker } from '@/app/providers/AmplitudeTracker'

const appStore = useAppStore()
const bankStore = useBankStore()
const modalStore = useModalStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
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
const isBaseAmount = ref(true)
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
  limitPrice,
  triggerPrice,
  hasBaseAmount,
  hasTriggerPrice,
  tradingTypeLimit,
  tradingTypeMarket,
  isConditionalOrder,
  tradingTypeStopLimit,
  tradingTypeStopMarket
} = useDerivativeFormFormatter(formValues)

const { makerFeeRate, takerFeeRate } = useTradeFee(computed(() => props.market))
const { markPrice, lastTradedPrice } = useDerivativeLastPrice(
  computed(() => props.market)
)

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
      ? triggerPriceInBase.lt(markPrice.value)
        ? DerivativeOrderSide.TakeBuy
        : DerivativeOrderSide.StopBuy
      : triggerPriceInBase.gt(markPrice.value)
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

const {
  slippage,
  maxReduceOnly,
  maxAmountOnOrderbook,
  updateAmountFromBase,
  worstPriceWithSlippage
} = useDerivativePrice({
  formValues,
  isBaseAmount,
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
  const balance = bankStore.balanceMap[props.market.quoteDenom] || '0'

  const quoteAvailableBalance = new BigNumberInWei(balance).toBase(
    props.market.quoteToken.decimals
  )

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
        tensMultiplier: props.market.quantityTensMultiplier
      }).toFixed()
    )
  }

  return new BigNumberInBase(
    calculateMargin({
      price,
      quantity: formValues.value[TradeField.BaseAmount],
      tensMultiplier: props.market.quantityTensMultiplier,
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
        price: worstPriceWithSlippage.value.toFixed(),
        orderSide: formValues.value[TradeField.OrderType],
        quantity: formValues.value[TradeField.BaseAmount],
        tensMultiplier: props.market.quantityTensMultiplier
      }).toFixed()
    )
  }

  return new BigNumberInBase(
    calculateMargin({
      price: worstPriceWithSlippage.value.toFixed(),
      leverage: formValues.value[TradeField.Leverage],
      quantity: formValues.value[TradeField.BaseAmount],
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
    quantity: formValues.value[TradeField.BaseAmount],
    orderType: formValues.value[TradeField.OrderType],
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
  formValues,
  executionPrice,
  orderTypeReduceOnly,
  notionalWithLeverage,
  quoteAvailableBalance,
  worstPriceWithSlippage,
  notionalWithLeverageAndFees,
  notionalWithLeverageBasedOnWorstPrice,
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
    updateFormValue({
      field: isBaseAmountUpdate
        ? TradeField.QuoteAmount
        : TradeField.BaseAmount,
      value: amountToUpdate
    })
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
      orderType: orderTypeToSubmit.value,
      reduceOnly: orderTypeReduceOnly.value
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
      market: props.market,
      price: limitPrice.value,
      quantity: baseAmount.value,
      triggerPrice: triggerPrice.value,
      margin: notionalWithLeverage.value,
      orderType: orderTypeToSubmit.value,
      reduceOnly: orderTypeReduceOnly.value
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
      market: props.market,
      quantity: baseAmount.value,
      price: worstPriceWithSlippage.value,
      reduceOnly: orderTypeReduceOnly.value,
      orderType: formValues.value[TradeField.OrderType],
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
      orderType: orderTypeToSubmit.value,
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
    slippageTolerance,
    error: errorMessage,
    market: props.market.slug,
    marketType: props.market.subType,
    amount: formValues.value[TradeField.BaseAmount],
    leverage: formValues.value[TradeField.Leverage],
    orderType: formValues.value[TradeField.OrderType],
    reduceOnly: formValues.value[TradeField.ReduceOnly],
    limitPrice: formValues.value[TradeField.LimitPrice],
    tradingType: formValues.value[TradeField.TradingType],
    triggerPrice: formValues.value[TradeField.TriggerPrice]
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
        fees,
        isBuy,
        market,
        feeRate,
        position,
        priceStep,
        amountStep,
        formErrors,
        formValues,
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
      @update:formValue="updateFormValue"
    />

    <PartialsTradingFormDebug
      v-if="DEBUG_CALCULATION"
      v-bind="{
        fees,
        isBuy,
        market,
        feeRate,
        formValues,
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
        formErrors,
        formValues,
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
        market: market,
        amount: baseAmount,
        triggerPrice: triggerPrice,
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
