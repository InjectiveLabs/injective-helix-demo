<script setup lang="ts">
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  UiDerivativeMarket,
  derivativeMarketKey,
  DerivativeTradeTypes,
  DerivativesTradeForm,
  DerivativesTradeFormField
} from '@/types'

const derivativeMarket = inject(derivativeMarketKey) as Ref<UiDerivativeMarket>

const props = defineProps({
  margin: {
    type: BigNumberInBase,
    required: true
  },

  totalNotional: {
    type: BigNumberInBase,
    required: true
  },

  worstPrice: {
    type: BigNumberInBase,
    required: true
  },

  feeAmount: {
    type: BigNumberInBase,
    required: true
  },

  marginWithFee: {
    type: BigNumberInBase,
    required: true
  },

  quantity: {
    type: BigNumberInBase,
    required: true
  }
})

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

const isOrderTypeReduceOnly = computed(
  () => !!derivativeFormValues.value[DerivativesTradeFormField.ReduceOnly]
)

const isBuy = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Side] === OrderSide.Buy
)

const worstPriceWithSlippage = computed(() =>
  isBuy.value
    ? lastTradedPrice.value.times(1.01).dp(derivativeMarket.value.priceDecimals)
    : lastTradedPrice.value.times(0.99).dp(derivativeMarket.value.priceDecimals)
)

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
      quantity: props.quantity,
      margin: props.margin,
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
      quantity: props.quantity,
      triggerPrice: triggerPrice.value,
      margin: props.margin,
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
      quantity: props.quantity,
      price: new BigNumberInBase(worstPriceWithSlippage.value),
      reduceOnly: isOrderTypeReduceOnly.value,
      orderSide: derivativeFormValues.value[
        DerivativesTradeFormField.Side
      ] as OrderSide,
      margin: props.margin
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
      quantity: props.quantity,
      triggerPrice: triggerPrice.value,
      orderSide: orderTypeToSubmit.value,
      price: new BigNumberInBase(worstPriceWithSlippage.value),
      reduceOnly: isOrderTypeReduceOnly.value,
      margin: props.margin
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
    {{ orderTypeToSubmit }}
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
