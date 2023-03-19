<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInWei, Status, BigNumberInBase } from '@injectivelabs/utils'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import {
  ZERO_IN_BASE,
  SpotOrderSide,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  Modal,
  TradeForm,
  TradeField,
  TradeFormValue,
  OrderAttemptStatus
} from '@/types'
import { amplitudeTracker } from '@/app/providers/AmplitudeTracker'
import {
  DEBUG_CALCULATION,
  TRADE_FORM_PRICE_ROUNDING_MODE
} from '@/app/utils/constants'

const accountStore = useAccountStore()
const spotStore = useSpotStore()
const modalStore = useModalStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useNotifications()

const {
  values,
  setFieldValue,
  errors: formErrors,
  resetForm: resetFormValues
} = useForm<TradeForm>()

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const defaultStep = '1'
const isBaseAmount = ref(true)
const status = ref(new Status())

const formValues = computed(() => values)

const {
  baseAmount,
  limitPrice,
  hasBaseAmount,
  tradingTypeLimit,
  tradingTypeMarket
} = useSpotFormFormatter(formValues)

const { makerFeeRate, takerFeeRate } = useTradeFee(computed(() => props.market))

const amountStep = computed(() =>
  props.market
    ? new BigNumberInBase(1)
        .shiftedBy(props.market.quantityTensMultiplier)
        .toFixed()
    : defaultStep
)

const priceStep = computed(() =>
  props.market
    ? new BigNumberInBase(1).shiftedBy(-props.market.priceDecimals).toFixed()
    : defaultStep
)

const isBuy = computed(
  () => formValues.value[TradeField.OrderType] === SpotOrderSide.Buy
)

const orderTypeToSubmit = computed(() => {
  switch (true) {
    case formValues.value[TradeField.PostOnly] && isBuy.value: {
      return SpotOrderSide.BuyPO
    }
    case isBuy.value: {
      return SpotOrderSide.Buy
    }
    case formValues.value[TradeField.PostOnly] && !isBuy.value: {
      return SpotOrderSide.SellPO
    }
    case !isBuy.value: {
      return SpotOrderSide.Sell
    }
    default: {
      return SpotOrderSide.Buy
    }
  }
})

const baseAvailableBalance = computed(() => {
  const balance = accountStore.balanceMap[props.market.baseDenom] || '0'

  const baseAvailableBalance = new BigNumberInWei(balance).toBase(
    props.market.baseToken.decimals
  )

  return baseAvailableBalance
})

const quoteAvailableBalance = computed(() => {
  const balance = accountStore.balanceMap[props.market.quoteDenom] || '0'

  const quoteAvailableBalance = new BigNumberInWei(balance).toBase(
    props.market.quoteToken.decimals
  )

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

const hasExecutionPrice = computed(() => executionPrice.value.gt('0'))

const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))

const {
  slippage,
  maxAmountOnOrderbook,
  updateAmountFromBase,
  worstPriceWithSlippage
} = useSpotPrice({
  formValues,
  isBaseAmount,
  market: computed(() => props.market)
})

const executionPrice = computed(() => {
  return tradingTypeMarket.value
    ? worstPriceWithSlippage.value
    : limitPrice.value
})

const notionalValue = computed(() => {
  if (!hasExecutionPrice.value || !hasBaseAmount.value) {
    return ZERO_IN_BASE
  }

  const price = tradingTypeMarket.value
    ? worstPriceWithSlippage.value
    : limitPrice.value

  return price.times(formValues.value[TradeField.BaseAmount])
})

const fees = computed(() => {
  if (notionalValue.value.isNaN()) {
    return ZERO_IN_BASE
  }

  return notionalValue.value.times(feeRate.value)
})

const notionalWithFees = computed(() => {
  if (notionalValue.value.isNaN() || notionalValue.value.lte(0)) {
    return ZERO_IN_BASE
  }

  return isBuy.value
    ? fees.value.plus(notionalValue.value)
    : notionalValue.value.minus(fees.value)
})

const { availableBalanceError, highDeviation, maxOrdersError } = useSpotError({
  isBuy,
  formValues,
  executionPrice,
  notionalWithFees,
  quoteAvailableBalance,
  market: computed(() => props.market)
})

watch(
  lastTradedPrice,
  (newPrice: BigNumberInBase) => {
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

watch(executionPrice, () => {
  if (maxAmountOnOrderbook.value.totalQuantity.eq(0)) {
    return
  }

  updateAmount({ isBaseAmount: isBaseAmount.value })
})

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

function setDefaultFormValues() {
  updateFormValue({ field: TradeField.BaseAmount, value: amountStep.value })
  updateFormValue({
    field: TradeField.LimitPrice,
    value: lastTradedPrice.value.toFixed(
      props.market.priceDecimals,
      TRADE_FORM_PRICE_ROUNDING_MODE
    )
  })
}

function resetForm() {
  resetFormValues()
  setDefaultFormValues()
}

function submitLimitOrder() {
  status.value.setLoading()

  spotStore
    .submitLimitOrder({
      market: props.market,
      price: limitPrice.value,
      quantity: baseAmount.value,
      orderType: orderTypeToSubmit.value
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
      status.value.setIdle()
    })
}

function submitMarketOrder() {
  status.value.setLoading()

  spotStore
    .submitMarketOrder({
      isBuy: isBuy.value,
      market: props.market,
      quantity: baseAmount.value,
      price: worstPriceWithSlippage.value
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
      status.value.setIdle()
    })
}

function handleRequestSubmit() {
  if (highDeviation.value) {
    return modalStore.openModal({
      type: Modal.PriceDeviation
    })
  }

  return handleSubmit()
}

function handleSubmit() {
  switch (formValues.value[TradeField.TradingType]) {
    case TradeExecutionType.LimitFill:
      return submitLimitOrder()
    case TradeExecutionType.Market:
      return submitMarketOrder()
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
    orderType: formValues.value[TradeField.OrderType],
    limitPrice: formValues.value[TradeField.LimitPrice],
    tradingType: formValues.value[TradeField.TradingType]
  })
}
</script>

<template>
  <div v-if="lastTradedPrice" class="w-full flex flex-col gap-6">
    <PartialsTradingFormTradeExecutionTypeButtons
      @form:reset="setDefaultFormValues"
    />

    <PartialsTradingFormOrderTypeSelect
      v-bind="{ market: props.market }"
      @update:formValue="updateFormValue"
    />

    <PartialsTradingFormOrderInputs
      v-bind="{
        fees,
        isBuy,
        market,
        feeRate,
        priceStep,
        amountStep,
        isBaseAmount,
        executionPrice,
        lastTradedPrice,
        baseAvailableBalance,
        maxAmountOnOrderbook,
        availableBalanceError,
        quoteAvailableBalance,
        worstPriceWithSlippage
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
        isSpot: true,
        isBaseAmount,
        notionalValue,
        notionalWithFees
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
        notionalValue,
        executionPrice,
        notionalWithFees
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
        availableBalanceError
      }"
      @submit:request="handleRequestSubmit"
    />

    <ModalsPriceDeviation @order:confirmed="handleSubmit" />
  </div>
</template>
