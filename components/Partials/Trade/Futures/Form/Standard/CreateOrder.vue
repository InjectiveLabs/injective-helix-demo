<script setup lang="ts">
import {
  MsgType,
  OrderSide,
  TradeDirection,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import { SharedMarketType } from '@shared/types'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
import { getDerivativeOrderTypeToSubmit } from '@/app/utils/helpers'
import { slugsToIncludeInRWACategory } from '@/app/data/market'
import {
  Modal,
  MarketKey,
  OrderAttemptStatus,
  UiDerivativeMarket,
  DerivativeTradeTypes,
  DerivativesTradeForm,
  DerivativesTradeFormField
} from '@/types'

const route = useRoute()
const resetForm = useResetForm()
const modalStore = useModalStore()
const authZStore = useAuthZStore()
const validate = useValidateForm()
const formErrors = useFormErrors()
const walletStore = useWalletStore()
const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()
const { t } = useLang()
const { $onError } = useNuxtApp()

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

const isRWAMarket = slugsToIncludeInRWACategory.includes(
  route.params.slug as string
)

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const status = reactive(new Status(StatusType.Idle))

const { markPrice } = useDerivativeLastPrice(
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

const isLimitOrder = computed(() =>
  [DerivativeTradeTypes.Limit, DerivativeTradeTypes.StopLimit].includes(
    derivativeFormValues.value[
      DerivativesTradeFormField.Type
    ] as DerivativeTradeTypes
  )
)

const isAuthorized = computed(() => {
  if (!walletStore.isAuthzWalletConnected) {
    return true
  }

  const msg = isLimitOrder.value
    ? MsgType.MsgCreateDerivativeLimitOrder
    : MsgType.MsgCreateDerivativeMarketOrder

  return authZStore.hasAuthZPermission(msg)
})

const isBuy = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long
)

const currentFormValues = computed(
  () =>
    ({
      [DerivativesTradeFormField.Type]:
        derivativeFormValues.value[DerivativesTradeFormField.Type],
      [DerivativesTradeFormField.Side]:
        derivativeFormValues.value[DerivativesTradeFormField.Side],
      [DerivativesTradeFormField.AmountOption]:
        derivativeFormValues.value[DerivativesTradeFormField.AmountOption],
      [DerivativesTradeFormField.Slippage]:
        derivativeFormValues.value[DerivativesTradeFormField.Slippage],
      [DerivativesTradeFormField.IsSlippageOn]:
        derivativeFormValues.value[DerivativesTradeFormField.IsSlippageOn],
      [DerivativesTradeFormField.Leverage]: '1'
    }) as DerivativesTradeForm
)

const orderTypeToSubmit = computed(() =>
  getDerivativeOrderTypeToSubmit({
    isStopOrder: [
      DerivativeTradeTypes.StopLimit,
      DerivativeTradeTypes.StopMarket
    ].includes(
      derivativeFormValues.value[
        DerivativesTradeFormField.Type
      ] as DerivativeTradeTypes
    ),
    isBuy: isBuy.value,
    isPostOnly:
      !!derivativeFormValues.value[DerivativesTradeFormField.PostOnly],
    markPrice: markPrice.value,
    triggerPrice: triggerPrice.value.toFixed()
  })
)

const stopLossValue = computed(() =>
  derivativeFormValues.value[DerivativesTradeFormField.isTpSlEnabled]
    ? new BigNumberInBase(
        derivativeFormValues.value[DerivativesTradeFormField.StopLoss] || 0
      )
    : undefined
)

const takeProfitValue = computed(() =>
  derivativeFormValues.value[DerivativesTradeFormField.isTpSlEnabled]
    ? new BigNumberInBase(
        derivativeFormValues.value[DerivativesTradeFormField.TakeProfit] || 0
      )
    : undefined
)

const filteredFormErrors = computed(() => {
  const isLimitOrStopLimit = [
    DerivativeTradeTypes.Limit,
    DerivativeTradeTypes.StopLimit
  ].includes(
    derivativeFormValues.value[
      DerivativesTradeFormField.Type
    ] as DerivativeTradeTypes
  )

  return Object.keys(formErrors.value).filter(
    (key) =>
      !isLimitOrStopLimit ||
      (key === DerivativesTradeFormField.LimitPrice &&
        !derivativeFormValues.value[
          DerivativesTradeFormField.BypassPriceWarning
        ])
  )
})

const isDisabled = computed(() => {
  const tradeType = derivativeFormValues.value[
    DerivativesTradeFormField.Type
  ] as DerivativeTradeTypes

  if (filteredFormErrors.value.length > 0) {
    return true
  }

  if (!derivativeFormValues.value[DerivativesTradeFormField.Amount]) {
    return true
  }

  if (!isAuthorized.value) {
    return true
  }

  if (
    [DerivativeTradeTypes.Limit, DerivativeTradeTypes.StopLimit].includes(
      tradeType
    ) &&
    !derivativeFormValues.value[DerivativesTradeFormField.LimitPrice]
  ) {
    return true
  }

  if (
    [DerivativeTradeTypes.StopLimit, DerivativeTradeTypes.StopMarket].includes(
      tradeType
    ) &&
    !derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice]
  ) {
    return true
  }
})

function submitLimitOrder() {
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
      notificationStore.success({ title: t('trade.order_placed') })
      resetForm({ values: currentFormValues.value })

      mixpanelAnalytics.trackPlaceOrderConfirm({
        amount: props.quantity.toFixed(),
        market: derivativeMarket.value.slug as string,
        limitPrice: limitPrice.value.toFixed(),
        marketType: SharedMarketType.Derivative,
        orderSide:
          derivativeFormValues.value[DerivativesTradeFormField.Side] ===
          TradeDirection.Long
            ? OrderSide.Buy
            : OrderSide.Sell,
        postOnly:
          !!derivativeFormValues.value[DerivativesTradeFormField.PostOnly],
        tradingType: TradeExecutionType.LimitFill,
        status: OrderAttemptStatus.Success,
        leverage:
          derivativeFormValues.value[DerivativesTradeFormField.Leverage],
        slippageTolerance: ''
      })
    })
    .catch((e) => {
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
      market: derivativeMarket?.value,
      price: limitPrice.value,
      quantity: props.quantity,
      triggerPrice: triggerPrice.value,
      margin: props.margin,
      orderSide: orderTypeToSubmit.value,
      reduceOnly: isOrderTypeReduceOnly.value
    })
    .then(() => {
      notificationStore.success({ title: t('trade.order_placed') })
      resetForm({ values: currentFormValues.value })

      mixpanelAnalytics.trackPlaceOrderConfirm({
        amount: props.quantity.toFixed(),
        market: derivativeMarket.value.slug as string,
        limitPrice: limitPrice.value.toFixed(),
        marketType: SharedMarketType.Derivative,
        orderSide:
          derivativeFormValues.value[DerivativesTradeFormField.Side] ===
          TradeDirection.Long
            ? OrderSide.Buy
            : OrderSide.Sell,
        postOnly:
          !!derivativeFormValues.value[DerivativesTradeFormField.PostOnly],
        tradingType: TradeExecutionType.LimitFill,
        status: OrderAttemptStatus.Success,
        leverage:
          derivativeFormValues.value[DerivativesTradeFormField.Leverage],
        slippageTolerance: '',
        triggerPrice: triggerPrice.value.toFixed()
      })
    })
    .catch((e) => {
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
      market: derivativeMarket?.value,
      quantity: props.quantity,
      price: new BigNumberInBase(props.worstPrice),
      reduceOnly: isOrderTypeReduceOnly.value,
      orderSide: orderTypeToSubmit.value,
      margin: props.margin,
      stopLoss: stopLossValue.value,
      takeProfit: takeProfitValue.value
    })
    .then(() => {
      notificationStore.success({ title: t('trade.order_placed') })
      resetForm({ values: currentFormValues.value })

      mixpanelAnalytics.trackPlaceOrderConfirm({
        amount: props.quantity.toFixed(),
        market: derivativeMarket.value.slug as string,
        limitPrice: '',
        marketType: SharedMarketType.Derivative,
        orderSide:
          derivativeFormValues.value[DerivativesTradeFormField.Side] ===
          TradeDirection.Long
            ? OrderSide.Buy
            : OrderSide.Sell,
        postOnly:
          !!derivativeFormValues.value[DerivativesTradeFormField.PostOnly],
        tradingType: TradeExecutionType.Market,
        status: OrderAttemptStatus.Success,
        leverage:
          derivativeFormValues.value[DerivativesTradeFormField.Leverage],
        slippageTolerance: ''
      })
    })
    .catch((e) => {
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
      market: derivativeMarket?.value,
      quantity: props.quantity,
      triggerPrice: triggerPrice.value,
      orderSide: orderTypeToSubmit.value,
      price: new BigNumberInBase(props.worstPrice),
      reduceOnly: isOrderTypeReduceOnly.value,
      margin: props.margin
    })
    .then(() => {
      notificationStore.success({ title: t('trade.order_placed') })
      resetForm({ values: currentFormValues.value })

      mixpanelAnalytics.trackPlaceOrderConfirm({
        amount: props.quantity.toFixed(),
        market: derivativeMarket.value.slug as string,
        limitPrice: limitPrice.value.toFixed(),
        marketType: SharedMarketType.Derivative,
        orderSide:
          derivativeFormValues.value[DerivativesTradeFormField.Side] ===
          TradeDirection.Long
            ? OrderSide.Buy
            : OrderSide.Sell,
        postOnly:
          !!derivativeFormValues.value[DerivativesTradeFormField.PostOnly],
        tradingType: TradeExecutionType.LimitFill,
        status: OrderAttemptStatus.Success,
        leverage:
          derivativeFormValues.value[DerivativesTradeFormField.Leverage],
        slippageTolerance: '',
        triggerPrice: triggerPrice.value.toFixed()
      })
    })
    .catch((e) => {
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

function onSubmit() {
  if (isRWAMarket) {
    fetchRWAMarketIsOpen()

    return
  }

  submit()
}

async function submit() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

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

function fetchRWAMarketIsOpen() {
  if (!derivativeMarket.value) {
    return
  }

  derivativeStore
    .fetchRWAMarketIsOpen(derivativeMarket.value.oracleBase)
    .then((isMarketOpen) => {
      if (!isMarketOpen) {
        modalStore.openModal(Modal.ClosedRWAMarket)

        return
      }

      submit()
    })
    .catch($onError)
}
</script>

<template>
  <div>
    <div>
      <AppButton
        v-bind="{ status, disabled: isDisabled }"
        :key="derivativeFormValues[DerivativesTradeFormField.Side]"
        :variant="isBuy ? 'success' : 'danger'"
        class="w-full"
        @click="onSubmit"
      >
        <span v-if="isAuthorized">
          {{ $t(`trade.${isBuy ? 'buy' : 'sell'}`) }}
          /
          {{ $t(`trade.${isBuy ? 'long' : 'short'}`) }}
        </span>

        <span v-else>{{ $t('common.unauthorized') }}</span>
      </AppButton>
    </div>

    <ModalsClosedRWAMarket
      v-if="modalStore.modals[Modal.ClosedRWAMarket]"
      v-bind="{ worstPrice: worstPrice.toString() }"
      @terms:agreed="submit"
    />
  </div>
</template>
