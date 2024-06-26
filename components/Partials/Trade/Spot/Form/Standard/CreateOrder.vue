<script setup lang="ts">
import { SharedMarketType } from '@shared/types'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { MsgType, OrderSide, TradeExecutionType } from '@injectivelabs/ts-types'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
import {
  MarketKey,
  TradeTypes,
  UiSpotMarket,
  SpotTradeForm,
  OrderAttemptStatus,
  SpotTradeFormField
} from '@/types'

const props = defineProps({
  quantity: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  worstPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const formErrors = useFormErrors()
const validate = useValidateForm()
const walletStore = useWalletStore()
const resetForm = useResetForm<SpotTradeForm>()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const market = inject(MarketKey) as Ref<UiSpotMarket>

const status = reactive(new Status(StatusType.Idle))

const spotFormValues = useFormValues<SpotTradeForm>()

const isBuy = computed(
  () => spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
)

const orderTypeToSubmit = computed(() => {
  switch (true) {
    case spotFormValues.value[SpotTradeFormField.PostOnly] && isBuy.value: {
      return OrderSide.BuyPO
    }
    case isBuy.value: {
      return OrderSide.Buy
    }
    case spotFormValues.value[SpotTradeFormField.PostOnly] && !isBuy.value: {
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

const currentFormValues = computed(
  () =>
    ({
      [SpotTradeFormField.Type]: spotFormValues.value[SpotTradeFormField.Type],
      [SpotTradeFormField.Side]: spotFormValues.value[SpotTradeFormField.Side],
      [SpotTradeFormField.AmountOption]:
        spotFormValues.value[SpotTradeFormField.AmountOption],
      [SpotTradeFormField.Slippage]:
        spotFormValues.value[SpotTradeFormField.Slippage]
    }) as SpotTradeForm
)

const isLimitOrder = computed(
  () => spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
)

const isAuthorized = computed(() => {
  if (!walletStore.isAuthzWalletConnected) {
    return true
  }

  const msg = isLimitOrder.value
    ? MsgType.MsgCreateSpotLimitOrder
    : MsgType.MsgCreateSpotMarketOrder

  return authZStore.hasAuthZPermission(msg)
})

const filteredFormErrors = computed(() =>
  Object.keys(formErrors.value).filter(
    (key) =>
      spotFormValues.value[SpotTradeFormField.Type] !== TradeTypes.Limit ||
      (key === SpotTradeFormField.Price &&
        !spotFormValues.value[SpotTradeFormField.BypassPriceWarning])
  )
)

const isDisabled = computed(() => {
  if (filteredFormErrors.value.length > 0) {
    return true
  }

  if (!spotFormValues.value[SpotTradeFormField.Amount]) {
    return true
  }

  if (!isAuthorized.value) {
    return true
  }

  if (spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit) {
    return !spotFormValues.value[SpotTradeFormField.Price]
  }
})

function submitLimitOrder() {
  if (!market || !market?.value) {
    return
  }

  status.setLoading()

  const limitPrice = new BigNumberInBase(
    spotFormValues.value[SpotTradeFormField.Price] || 0
  )

  const quantity = new BigNumberInBase(props.quantity)

  spotStore
    .submitLimitOrder({
      quantity,
      price: limitPrice,
      market: market.value,
      orderSide: orderTypeToSubmit.value
    })
    .then(() => {
      notificationStore.success({ title: t('trade.order_placed') })
      resetForm({ values: currentFormValues.value })

      mixpanelAnalytics.trackPlaceOrderConfirm({
        amount: quantity.toFixed(),
        market: market.value.slug as string,
        marketType: SharedMarketType.Spot,
        orderSide: spotFormValues.value[SpotTradeFormField.Side] as OrderSide,
        tradingType: TradeExecutionType.LimitFill,
        limitPrice: limitPrice.toFixed(),
        slippageTolerance:
          spotFormValues.value[SpotTradeFormField.Slippage] || '',
        postOnly: spotFormValues.value[SpotTradeFormField.PostOnly] || false,
        status: OrderAttemptStatus.Success
      })
    })
    .catch((e) => {
      mixpanelAnalytics.trackPlaceOrderAttempt({
        amount: quantity.toFixed(),
        market: market.value?.slug as string,
        marketType: SharedMarketType.Spot,
        tradingType: TradeExecutionType.LimitFill,
        limitPrice: limitPrice.toFixed(),
        slippageTolerance:
          spotFormValues.value[SpotTradeFormField.Slippage] || '',
        postOnly: spotFormValues.value[SpotTradeFormField.PostOnly] || false,
        leverage: '',
        triggerPrice: '',
        orderType: spotFormValues.value[SpotTradeFormField.Side] as OrderSide
      })
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

function submitMarketOrder() {
  if (!market?.value) {
    return
  }

  status.setLoading()

  const quantity = new BigNumberInBase(props.quantity)

  spotStore
    .submitMarketOrder({
      quantity,
      market: market.value,
      price: props.worstPrice,
      orderSide: orderTypeToSubmit.value
    })
    .then(() => {
      notificationStore.success({ title: t('trade.order_placed') })

      resetForm({ values: currentFormValues.value })

      mixpanelAnalytics.trackPlaceOrderConfirm({
        amount: quantity.toFixed(),
        market: market.value?.slug as string,
        marketType: SharedMarketType.Spot,
        orderSide: spotFormValues.value[SpotTradeFormField.Side] as OrderSide,
        tradingType: TradeExecutionType.Market,
        limitPrice: '',
        slippageTolerance:
          spotFormValues.value[SpotTradeFormField.Slippage] || '',
        postOnly: spotFormValues.value[SpotTradeFormField.PostOnly] || false,
        status: OrderAttemptStatus.Success
      })
    })
    .catch((e) => {
      mixpanelAnalytics.trackPlaceOrderAttempt({
        amount: quantity.toFixed(),
        market: market.value?.slug as string,
        marketType: SharedMarketType.Spot,
        tradingType: TradeExecutionType.Market,
        limitPrice: '',
        slippageTolerance:
          spotFormValues.value[SpotTradeFormField.Slippage] || '',
        postOnly: spotFormValues.value[SpotTradeFormField.PostOnly] || false,
        leverage: '',
        triggerPrice: '',
        orderType: spotFormValues.value[SpotTradeFormField.Side] as OrderSide
      })

      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}

async function submitOrder() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  if (isLimitOrder.value) {
    submitLimitOrder()
  } else {
    submitMarketOrder()
  }
}
</script>

<template>
  <div>
    <AppButton
      :key="spotFormValues[SpotTradeFormField.Side]"
      :variant="isBuy ? 'success' : 'danger'"
      class="w-full"
      v-bind="{ status, disabled: isDisabled }"
      @click="submitOrder"
    >
      <span v-if="isAuthorized">
        {{ $t(`trade.${isBuy ? 'buy' : 'sell'}`) }}
      </span>

      <span v-else>{{ $t('common.unauthorized') }}</span>
    </AppButton>
  </div>
</template>
