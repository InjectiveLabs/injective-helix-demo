<script lang="ts" setup>
import { SharedUiSpotMarket } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { OrderSide, TradeExecutionType } from '@injectivelabs/ts-types'
import { BigNumberInWei, Status, BigNumberInBase } from '@injectivelabs/utils'
import {
  DEBUG_CALCULATION,
  TRADE_FORM_PRICE_ROUNDING_MODE
} from '@/app/utils/constants'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
import { Modal, TradeForm, TradeField, OrderAttemptStatus } from '@/types'

const spotStore = useSpotStore()
const modalStore = useModalStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useNotifications()

const {
  meta: formMeta,
  values: formValues,
  resetForm: resetFormValues
} = useForm<TradeForm>()

const setFormValues = useSetFormValues()

const props = defineProps({
  market: {
    type: Object as PropType<SharedUiSpotMarket>,
    required: true
  }
})

const isBaseAmount = ref(true)
const status = ref(new Status())

const {
  baseAmount,
  limitPrice,
  hasBaseAmount,
  tradingTypeLimit,
  tradingTypeMarket
} = useSpotFormFormatter(computed(() => formValues))

const { makerFeeRate, takerFeeRate } = useTradeFee(computed(() => props.market))

const { accountBalancesWithToken } = useBalance()

const isBuy = computed(() => formValues[TradeField.OrderSide] === OrderSide.Buy)

const orderTypeToSubmit = computed(() => {
  switch (true) {
    case formValues[TradeField.PostOnly] && isBuy.value: {
      return OrderSide.BuyPO
    }
    case isBuy.value: {
      return OrderSide.Buy
    }
    case formValues[TradeField.PostOnly] && !isBuy.value: {
      return OrderSide.SellPO
    }
    case !isBuy.value: {
      return OrderSide.Sell
    }
    default: {
      return OrderSide.Buy
    }
  }
})

const baseAvailableBalance = computed(() => {
  const baseBalance = accountBalancesWithToken.value.find(
    (balance) =>
      balance.denom === (props.market as SharedUiSpotMarket).baseDenom
  )

  return new BigNumberInWei(baseBalance?.availableMargin || '0').toBase(
    props.market.baseToken.decimals
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

const hasExecutionPrice = computed(() => executionPrice.value.gt('0'))

const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))

const {
  slippage,
  maxAmountOnOrderbook,
  changeAmountFromBase,
  worstPriceWithSlippage
} = useSpotPrice({
  isBaseAmount,
  market: computed(() => props.market),
  formValues: computed(() => formValues)
})

const executionPrice = computed(() =>
  tradingTypeMarket.value ? worstPriceWithSlippage.value : limitPrice.value
)

const notionalValue = computed(() => {
  if (!hasExecutionPrice.value || !hasBaseAmount.value) {
    return ZERO_IN_BASE
  }

  const price = tradingTypeMarket.value
    ? worstPriceWithSlippage.value
    : limitPrice.value

  return price.times(formValues[TradeField.BaseAmount])
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

const { availableBalanceError, highDeviation } = useSpotError({
  isBuy,
  executionPrice,
  notionalWithFees,
  quoteAvailableBalance,
  market: computed(() => props.market),
  formValues: computed(() => formValues)
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

      setFormValues(
        {
          [TradeField.LimitPrice]: formattedPrice
        },
        false
      )
    }
  },
  { immediate: true }
)

watch(executionPrice, () => {
  if (maxAmountOnOrderbook.value.totalQuantity.eq(0)) {
    return
  }

  changeAmount({ isBaseAmount: isBaseAmount.value })
})

function changeAmount({
  amount,
  isBaseAmount: isBaseAmountUpdate
}: {
  amount?: string
  isBaseAmount: boolean
}) {
  isBaseAmount.value = isBaseAmountUpdate

  const amountToUpdate = changeAmountFromBase({
    amount,
    isBaseAmount: isBaseAmountUpdate
  })

  if (amountToUpdate) {
    const field = isBaseAmountUpdate
      ? TradeField.QuoteAmount
      : TradeField.BaseAmount

    setFormValues({
      [field]: amountToUpdate
    })
  }
}

function resetForm() {
  resetFormValues({
    values: {
      ...formMeta.value.initialValues,
      [TradeField.OrderSide]: formValues[TradeField.OrderSide],
      [TradeField.TradingType]: formValues[TradeField.TradingType],
      [TradeField.LimitPrice]: lastTradedPrice.value.toFixed(
        props.market.priceDecimals,
        TRADE_FORM_PRICE_ROUNDING_MODE
      )
    } as TradeForm
  })
}

function submitLimitOrder() {
  status.value.setLoading()

  spotStore
    .submitLimitOrder({
      market: props.market,
      price: limitPrice.value,
      quantity: baseAmount.value,
      orderSide: orderTypeToSubmit.value
    })
    .then(() => {
      attemptPlaceOrderTrack()
      success({ title: t('trade.order_placed') })
      resetForm()
    })
    .catch((e) => {
      attemptPlaceOrderTrack(e.message)
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
      attemptPlaceOrderTrack()
      success({ title: t('trade.order_placed') })
      resetForm()
    })
    .catch((e) => {
      attemptPlaceOrderTrack(e)
      $onError(e)
    })
    .finally(() => {
      status.value.setIdle()
    })
}

function onRequestSubmit() {
  if (highDeviation.value) {
    return modalStore.openModal(Modal.PriceDeviation)
  }

  return submit()
}

function submit() {
  switch (formValues[TradeField.TradingType]) {
    case TradeExecutionType.LimitFill:
      return submitLimitOrder()
    case TradeExecutionType.Market:
      return submitMarketOrder()
  }
}

function attemptPlaceOrderTrack(errorMessage?: string) {
  const slippageTolerance = tradingTypeMarket.value
    ? formValues[TradeField.SlippageTolerance]
    : ''
  const postOnly = tradingTypeLimit.value && formValues[TradeField.PostOnly]
  const status = errorMessage
    ? OrderAttemptStatus.Error
    : OrderAttemptStatus.Success

  mixpanelAnalytics.trackPlaceOrderConfirm({
    status,
    postOnly,
    slippageTolerance,
    market: props.market.slug,
    marketType: props.market.subType,
    amount: formValues[TradeField.BaseAmount],
    orderSide: formValues[TradeField.OrderSide],
    limitPrice: formValues[TradeField.LimitPrice],
    tradingType: formValues[TradeField.TradingType]
  })
}
</script>

<template>
  <div v-if="lastTradedPrice" class="w-full flex flex-col gap-6">
    <PartialsTradingFormTradeExecutionTypeButtons @form:reset="resetForm" />
    <PartialsTradingFormOrderSideSelect v-bind="{ market: props.market }" />
    <PartialsTradingFormOrderInputs
      v-bind="{
        fees,
        isBuy,
        market,
        feeRate,
        isBaseAmount,
        executionPrice,
        lastTradedPrice,
        baseAvailableBalance,
        maxAmountOnOrderbook,
        availableBalanceError,
        quoteAvailableBalance,
        worstPriceWithSlippage
      }"
      @update:amount="changeAmount"
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
        formValues,
        hasBaseAmount,
        highDeviation,
        executionPrice,
        availableBalanceError
      }"
      @submit:request="onRequestSubmit"
    />

    <ModalsPriceDeviation @order:confirmed="submit" />
  </div>
</template>
