<script setup lang="ts">
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { calculateMargin } from '@/app/client/utils/derivatives'
import {
  UiDerivativeMarket,
  derivativeMarketKey,
  DerivativeTradeTypes,
  DerivativesTradeForm,
  DerivativesTradeFormField
} from '@/types'

const derivativeMarket = inject(derivativeMarketKey) as Ref<UiDerivativeMarket>

const derivativeStore = useDerivativeStore()
const status = reactive(new Status(StatusType.Loading))
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()
const validate = useValidateForm()

const derivativeFormValues = useFormValues<DerivativesTradeForm>()
const resetForm = useResetForm()

const { markPrice, lastTradedPrice } = useDerivativeLastPrice(
  computed(() => derivativeMarket?.value)
)

const triggerPrice = computed(
  () =>
    new BigNumberInBase(
      derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice] || 0
    )
)

const limitPrice = computed(
  () =>
    new BigNumberInBase(
      derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || 0
    )
)

const baseAmount = computed(
  () =>
    new BigNumberInBase(
      0 // TODO
    )
)

const isOrderTypeReduceOnly = computed(
  () => !!derivativeFormValues.value[DerivativesTradeFormField.ReduceOnly]
)

const isBuy = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Side] === OrderSide.Buy
)

// const isMarketOrStopMarketOrder = computed(() =>
//   [DerivativeTradeTypes.Market, DerivativeTradeTypes.StopMarket].includes(
//     derivativeFormValues.value[
//       DerivativesTradeFormField.Type
//     ] as DerivativeTradeTypes
//   )
// )

// const executionPrice = computed(() =>
//   isMarketOrStopMarketOrder.value
//     ? lastTradedPrice.value
//     : new BigNumberInBase(
//         derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || 0
//       )
// )

const worstPriceWithSlippage = computed(() =>
  isBuy.value
    ? lastTradedPrice.value.times(1.01).dp(derivativeMarket.value.priceDecimals)
    : lastTradedPrice.value.times(0.99).dp(derivativeMarket.value.priceDecimals)
)

const notionalWithLeverage = computed(() => {
  return new BigNumberInBase(
    calculateMargin({
      price: '0', // TODO
      quantity: baseAmount.value.toFixed(),
      quoteTokenDecimals: derivativeMarket.value.quoteToken.decimals,
      tensMultiplier: derivativeMarket.value.quantityTensMultiplier,
      leverage:
        derivativeFormValues.value[DerivativesTradeFormField.Leverage] || '1'
    }).toFixed()
  )
})

const orderTypeToSubmit = computed(() => {
  if (
    [DerivativeTradeTypes.StopLimit, DerivativeTradeTypes.StopMarket].includes(
      derivativeFormValues.value[
        DerivativesTradeFormField.Type
      ] as DerivativeTradeTypes
    )
  ) {
    const triggerPriceInBase = new BigNumberInBase(
      derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice] || 0
    )

    return isBuy.value
      ? triggerPriceInBase.lt(markPrice.value)
        ? OrderSide.TakeBuy
        : OrderSide.StopBuy
      : triggerPriceInBase.gt(markPrice.value)
      ? OrderSide.TakeSell
      : OrderSide.StopSell
  }

  switch (true) {
    case derivativeFormValues.value[DerivativesTradeFormField.PostOnly] &&
      isBuy.value:
      return OrderSide.BuyPO
    case isBuy.value:
      return OrderSide.Buy
    case derivativeFormValues.value[DerivativesTradeFormField.PostOnly] &&
      !isBuy.value:
      return OrderSide.SellPO
    case !isBuy.value:
      return OrderSide.Sell
    default:
      return OrderSide.Buy
  }
})

async function submitLimitOrder() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  status.setLoading()

  derivativeStore
    .submitLimitOrder({
      market: derivativeMarket?.value,
      price: limitPrice.value,
      quantity: baseAmount.value,
      margin: notionalWithLeverage.value,
      orderSide: orderTypeToSubmit.value,
      reduceOnly: isOrderTypeReduceOnly.value
    })
    .then(() => {
      success({ title: t('trade.order_placed') })
      resetForm()
    })
    .catch((e) => {
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

async function submitStopLimitOrder() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  if (!triggerPrice.value) {
    return
  }

  status.setLoading()

  derivativeStore
    .submitStopLimitOrder({
      market: derivativeMarket?.value,
      price: limitPrice.value,
      quantity: baseAmount.value,
      triggerPrice: triggerPrice.value,
      margin: notionalWithLeverage.value,
      orderSide: orderTypeToSubmit.value,
      reduceOnly: isOrderTypeReduceOnly.value
    })
    .then(() => {
      success({ title: t('trade.order_placed') })
      resetForm()
    })
    .catch((e) => {
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

async function submitMarketOrder() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  status.setLoading()

  derivativeStore
    .submitMarketOrder({
      market: derivativeMarket?.value,
      quantity: baseAmount.value,
      price: new BigNumberInBase(worstPriceWithSlippage.value),
      reduceOnly: isOrderTypeReduceOnly.value,
      orderSide: derivativeFormValues.value[
        DerivativesTradeFormField.Side
      ] as OrderSide,
      margin: notionalWithLeverage.value
    })
    .then(() => {
      success({ title: t('trade.order_placed') })
      resetForm()
    })
    .catch((e) => {
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

async function submitStopMarketOrder() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  if (!triggerPrice.value) {
    return
  }

  status.setLoading()

  derivativeStore
    .submitStopMarketOrder({
      market: derivativeMarket?.value,
      quantity: baseAmount.value,
      triggerPrice: triggerPrice.value,
      orderSide: orderTypeToSubmit.value,
      price: new BigNumberInBase(worstPriceWithSlippage.value),
      reduceOnly: isOrderTypeReduceOnly.value,
      margin: notionalWithLeverage.value
    })
    .then(() => {
      success({ title: t('trade.order_placed') })
      resetForm()
    })
    .catch((e) => {
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

function onSubmit() {
  switch (derivativeFormValues.value[DerivativesTradeFormField.Type]) {
    case DerivativeTradeTypes.Limit:
      return submitLimitOrder()
    case DerivativeTradeTypes.Market:
      return submitMarketOrder()
    case DerivativeTradeTypes.StopLimit:
      return submitStopLimitOrder()
    case DerivativeTradeTypes.StopMarket:
      submitStopMarketOrder()
  }
}
</script>

<template>
  <div>
    <div>
      <AppButton
        :key="derivativeFormValues[DerivativesTradeFormField.Side]"
        :variant="isBuy ? 'success' : 'danger'"
        class="w-full"
        @click="onSubmit"
      >
        {{ $t(`trade.${isBuy ? 'buy' : 'sell'}`) }}
      </AppButton>
    </div>
  </div>
</template>
