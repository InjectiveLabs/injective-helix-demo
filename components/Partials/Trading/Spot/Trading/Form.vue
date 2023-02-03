<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInWei, Status, BigNumberInBase } from '@injectivelabs/utils'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import {
  UiSpotMarketWithToken,
  SpotOrderSide,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import {
  Modal,
  OrderAttemptStatus,
  TradeField,
  TradeForm,
  TradeFormValue
} from '@/types'
import { amplitudeTracker } from '@/app/providers/AmplitudeTracker'
import {
  DEBUG_CALCULATION,
  TRADE_FORM_PRICE_ROUNDING_MODE
} from '@/app/utils/constants'

const accountStore = useAccountStore()
const modalStore = useModalStore()
const spotStore = useSpotStore()
const { success } = useNotifications()
const { t } = useLang()
const { $onError } = useNuxtApp()

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
const isBase = ref(true)
const status = ref(new Status())

const formValues = computed(() => values)

const {
  baseAmount,
  hasBaseAmount,
  limitPrice,
  tradingTypeLimit,
  tradingTypeMarket
} = useSpotFormFormatter(formValues)

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
  if (!accountStore.subaccount || !accountStore.subaccount.balances) {
    return ZERO_IN_BASE
  }

  const balance = accountStore.subaccount.balances.find(
    (balance) =>
      balance.denom.toLowerCase() === props.market.baseDenom.toLowerCase()
  )

  if (!balance) {
    return ZERO_IN_BASE
  }

  const baseAvailableBalance = new BigNumberInWei(
    balance.availableBalance || 0
  ).toBase(props.market.baseToken.decimals)

  if (baseAvailableBalance.isNaN()) {
    return ZERO_IN_BASE
  }

  return baseAvailableBalance
})

const quoteAvailableBalance = computed(() => {
  if (!accountStore.subaccount) {
    return ZERO_IN_BASE
  }

  const balance = accountStore.subaccount.balances.find(
    (balance) =>
      balance.denom.toLowerCase() === props.market.quoteDenom.toLowerCase()
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

const hasExecutionPrice = computed(() => executionPrice.value.gt('0'))

const { lastTradedPrice } = useSpotLastPriceFormatter(
  computed(() => props.market)
)

const {
  maxAmountOnOrderbook,
  slippage,
  updateAmountFromBase,
  worstPriceWithSlippage
} = useSpotPrice({
  formValues,
  isBase,
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
  executionPrice,
  formValues,
  isBuy,
  market: computed(() => props.market),
  notionalWithFees,
  quoteAvailableBalance
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

  updateAmount({ isBase: isBase.value })
})

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

  const amountToUpdate = updateAmountFromBase({ amount, isBase: isBaseUpdate })

  if (amountToUpdate) {
    updateFormValue({
      field: isBaseUpdate ? TradeField.QuoteAmount : TradeField.BaseAmount,
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
      price: limitPrice.value,
      quantity: baseAmount.value,
      market: props.market,
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
    orderType: formValues.value[TradeField.OrderType],
    tradingType: formValues.value[TradeField.TradingType],
    slippageTolerance,
    amount: formValues.value[TradeField.BaseAmount],
    market: props.market.slug,
    marketType: props.market.subType,
    limitPrice: formValues.value[TradeField.LimitPrice],
    error: errorMessage
  })
}
</script>

<template>
  <div v-if="lastTradedPrice" class="w-full flex flex-col gap-6">
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
        availableBalanceError,
        amountStep,
        baseAvailableBalance,
        executionPrice,
        feeRate,
        fees,
        formErrors,
        formValues,
        lastTradedPrice,
        isBase,
        isBuy,
        market,
        maxAmountOnOrderbook,
        priceStep,
        quoteAvailableBalance,
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
        notionalValue,
        notionalWithFees,
        isSpot: true
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
        market,
        notionalValue,
        notionalWithFees,
        slippage
      }"
    />

    <PartialsTradingFormOrderSubmit
      v-bind="{
        availableBalanceError,
        executionPrice,
        formErrors,
        formValues,
        hasBaseAmount,
        highDeviation,
        isBuy,
        market,
        maxOrdersError,
        status
      }"
      @submit:request="handleRequestSubmit"
    />

    <ModalsPriceDeviation @confirmed="handleSubmit" />
  </div>
</template>
