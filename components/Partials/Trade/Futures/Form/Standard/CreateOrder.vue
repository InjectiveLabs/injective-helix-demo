<script setup lang="ts">
import { SharedMarketType } from '@shared/types'
import { MsgType, TradeDirection } from '@injectivelabs/ts-types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_LEVERAGE } from '@/app/utils/constants'
import { getDerivativeOrderTypeToSubmit } from '@/app/utils/helpers'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import {
  Modal,
  BusEvents,
  MarketKey,
  ChartViewOption,
  MixPanelOrderType,
  IsRWAMarketOpenKey,
  DerivativeTradeTypes,
  DerivativesTradeFormField
} from '@/types'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

const resetForm = useResetForm()
const authZStore = useAuthZStore()
const validate = useValidateForm()
const formErrors = useFormErrors()
const jsonStore = useSharedJsonStore()
const modalStore = useSharedModalStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()
const { t } = useLang()
const { $onError } = useNuxtApp()

const isRWAMarketOpen = inject(IsRWAMarketOpenKey) as Ref<boolean>
const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const { markPrice } = useDerivativeLastPrice(
  computed(() => derivativeMarket?.value)
)
const { isLimitOrder, hasEnoughLiquidity, isNotionalLessThanMinNotional } =
  useDerivativeWorstPrice(derivativeMarket)

const props = withDefaults(
  defineProps<{
    margin: BigNumberInBase
    quantity: BigNumberInBase
    feeAmount: BigNumberInBase
    worstPrice: BigNumberInBase
    totalNotional: BigNumberInBase
    marginWithFee: BigNumberInBase
  }>(),
  {}
)

const chartType = ref(ChartViewOption.Chart)
const status = reactive(new Status(StatusType.Idle))

const isRWAMarket = computed(() =>
  jsonStore.isTradeFiMarket(derivativeMarket.value.marketId)
)

const isPostOnlyEnable = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
    DerivativeTradeTypes.Limit
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

const isAuthorized = computed(() => {
  if (!sharedWalletStore.isAuthzWalletConnected) {
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
      [DerivativesTradeFormField.Leverage]: UI_DEFAULT_LEVERAGE,
      [DerivativesTradeFormField.Type]:
        derivativeFormValues.value[DerivativesTradeFormField.Type],
      [DerivativesTradeFormField.Side]:
        derivativeFormValues.value[DerivativesTradeFormField.Side],
      [DerivativesTradeFormField.Slippage]:
        derivativeFormValues.value[DerivativesTradeFormField.Slippage],
      [DerivativesTradeFormField.AmountOption]:
        derivativeFormValues.value[DerivativesTradeFormField.AmountOption]
    }) as DerivativesTradeForm
)

const orderTypeToSubmit = computed(() =>
  getDerivativeOrderTypeToSubmit({
    isBuy: isBuy.value,
    markPrice: markPrice.value,
    triggerPrice: triggerPrice.value.toFixed(),
    isPostOnly:
      !!derivativeFormValues.value[DerivativesTradeFormField.PostOnly],
    isStopOrder: [
      DerivativeTradeTypes.StopLimit,
      DerivativeTradeTypes.StopMarket
    ].includes(
      derivativeFormValues.value[
        DerivativesTradeFormField.Type
      ] as DerivativeTradeTypes
    )
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

const isDisabled = computed(() => {
  const tradeType = derivativeFormValues.value[
    DerivativesTradeFormField.Type
  ] as DerivativeTradeTypes

  if (!isPostOnlyEnable.value && jsonStore.isPostUpgradeMode) {
    return true
  }

  if (Object.keys(formErrors.value).length > 0) {
    return true
  }

  if (!derivativeFormValues.value[DerivativesTradeFormField.Amount]) {
    return true
  }

  if (!isAuthorized.value) {
    return true
  }

  if (!hasEnoughLiquidity.value) {
    return true
  }

  if (isNotionalLessThanMinNotional.value) {
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

  return false
})

const mixPanelFields = computed(() => ({
  isBuy: isBuy.value,
  chartType: chartType.value,
  amount: props.quantity.toFixed(),
  market: derivativeMarket.value.slug,
  marketType: SharedMarketType.Derivative,
  reduceOnly: isOrderTypeReduceOnly.value,
  isAutoSign: sharedWalletStore.isAutoSignEnabled,
  postOnly: !!derivativeFormValues.value[DerivativesTradeFormField.PostOnly],
  leverage:
    derivativeFormValues.value[DerivativesTradeFormField.Leverage] || '',
  slippageTolerance:
    derivativeFormValues.value[DerivativesTradeFormField.Slippage] || ''
}))

onMounted(() => {
  useEventBus<ChartViewOption>(BusEvents.UpdateMarketChart).on((chart) => {
    chartType.value = chart
  })
})

function onSubmit() {
  if (!isRWAMarket.value) {
    submit()

    return
  }

  if (!isRWAMarketOpen.value) {
    return modalStore.openModal(Modal.ClosedRWAMarket)
  }

  submit()
}

async function submit() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  switch (derivativeFormValues.value[DerivativesTradeFormField.Type]) {
    case DerivativeTradeTypes.StopLimit:
      return submitStopLimitOrder()
    case DerivativeTradeTypes.Market:
      return submitMarketOrder()
    case DerivativeTradeTypes.Limit:
      return submitLimitOrder()
    case DerivativeTradeTypes.StopMarket:
      submitStopMarketOrder()
  }
}

async function submitLimitOrder() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  status.setLoading()

  let err: Error

  derivativeStore
    .submitLimitOrder({
      margin: props.margin,
      price: limitPrice.value,
      quantity: props.quantity,
      market: derivativeMarket?.value,
      orderSide: orderTypeToSubmit.value,
      reduceOnly: isOrderTypeReduceOnly.value
    })
    .then(() => {
      modalStore.openModal(Modal.IAsset)
      notificationStore.success({ title: t('trade.order_placed') })
      resetForm({ values: currentFormValues.value })
    })
    .catch((e) => {
      err = e
      $onError(e)
    })
    .finally(() => {
      EventTracker.trackCreateOrder(
        {
          ...mixPanelFields.value,
          triggerPrice: '',
          orderType: MixPanelOrderType.Limit,
          limitPrice: limitPrice.value.toFixed()
        },
        err?.message
      )
      status.setIdle()
    })
}

function submitMarketOrder() {
  status.setLoading()

  let err: Error

  derivativeStore
    .submitMarketOrder({
      margin: props.margin,
      quantity: props.quantity,
      stopLoss: stopLossValue.value,
      market: derivativeMarket?.value,
      takeProfit: takeProfitValue.value,
      orderSide: orderTypeToSubmit.value,
      reduceOnly: isOrderTypeReduceOnly.value,
      price: new BigNumberInBase(props.worstPrice)
    })
    .then(() => {
      modalStore.openModal(Modal.IAsset)
      notificationStore.success({ title: t('trade.order_placed') })
      resetForm({ values: currentFormValues.value })
    })
    .catch((e) => {
      err = e
      $onError(e)
    })
    .finally(() => {
      EventTracker.trackCreateOrder(
        {
          ...mixPanelFields.value,
          limitPrice: '',
          triggerPrice: '',
          orderType: MixPanelOrderType.Market
        },
        err?.message
      )

      status.setIdle()
    })
}

function submitStopLimitOrder() {
  if (!triggerPrice.value) {
    return
  }

  status.setLoading()

  let err: Error

  derivativeStore
    .submitStopLimitOrder({
      margin: props.margin,
      price: limitPrice.value,
      quantity: props.quantity,
      market: derivativeMarket?.value,
      triggerPrice: triggerPrice.value,
      orderSide: orderTypeToSubmit.value,
      reduceOnly: isOrderTypeReduceOnly.value
    })
    .then(() => {
      modalStore.openModal(Modal.IAsset)
      notificationStore.success({ title: t('trade.order_placed') })
      resetForm({ values: currentFormValues.value })
    })
    .catch((e) => {
      err = e
      $onError(e)
    })
    .finally(() => {
      EventTracker.trackCreateOrder(
        {
          ...mixPanelFields.value,
          orderType: MixPanelOrderType.StopLimit,
          limitPrice: limitPrice.value.toFixed(),
          triggerPrice: triggerPrice.value.toFixed()
        },
        err?.message
      )

      status.setIdle()
    })
}

function submitStopMarketOrder() {
  if (!triggerPrice.value) {
    return
  }

  status.setLoading()

  let err: Error

  derivativeStore
    .submitStopMarketOrder({
      margin: props.margin,
      quantity: props.quantity,
      market: derivativeMarket?.value,
      triggerPrice: triggerPrice.value,
      orderSide: orderTypeToSubmit.value,
      reduceOnly: isOrderTypeReduceOnly.value,
      price: new BigNumberInBase(props.worstPrice)
    })
    .then(() => {
      modalStore.openModal(Modal.IAsset)
      notificationStore.success({ title: t('trade.order_placed') })
      resetForm({ values: currentFormValues.value })
    })
    .catch((e) => {
      err = e
      $onError(e)
    })
    .finally(() => {
      EventTracker.trackCreateOrder(
        {
          ...mixPanelFields.value,
          limitPrice: '',
          orderType: MixPanelOrderType.StopMarket,
          triggerPrice: triggerPrice.value.toFixed()
        },
        err?.message
      )

      status.setIdle()
    })
}
</script>

<template>
  <div>
    <div>
      <AppButton
        v-bind="{
          status,
          disabled: isDisabled
        }"
        :key="derivativeFormValues[DerivativesTradeFormField.Side]"
        :variant="isBuy ? 'success' : 'danger'"
        class="w-full"
        @click="onSubmit"
      >
        <span v-if="!isAuthorized">
          {{ $t('common.unauthorized') }}
        </span>

        <span v-else-if="!hasEnoughLiquidity">
          {{ $t('trade.swap.insufficient_liquidity') }}
        </span>

        <span v-else>
          {{ $t(`trade.${isBuy ? 'buy' : 'sell'}`) }}
          /
          {{ $t(`trade.${isBuy ? 'long' : 'short'}`) }}
        </span>
      </AppButton>

      <p
        v-if="!isPostOnlyEnable && jsonStore.isPostUpgradeMode"
        class="text-orange-500 text-xs mt-2"
      >
        {{ $t('trade.postOnlyWarning') }}
      </p>
    </div>

    <ModalsClosedRWAMarket
      v-bind="{ worstPrice: worstPrice.toString() }"
      @terms:agreed="submit"
    />
  </div>
</template>
