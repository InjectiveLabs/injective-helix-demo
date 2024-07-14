<script setup lang="ts">
import { SharedMarketType } from '@shared/types'
import { MsgType, OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import {
  BusEvents,
  MarketKey,
  TradeTypes,
  UiSpotMarket,
  SpotTradeForm,
  ChartViewOption,
  MixPanelOrderType,
  SpotTradeFormField
} from '@/types'

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const formErrors = useFormErrors()
const validate = useValidateForm()
const resetForm = useResetForm<SpotTradeForm>()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const market = inject(MarketKey) as Ref<UiSpotMarket>

const { isLimitOrder, isNotionalLessThanMinNotional } =
  useSpotWorstPrice(market)

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

const chartType = ref(ChartViewOption.Chart)
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

const isAuthorized = computed(() => {
  if (!sharedWalletStore.isAuthzWalletConnected) {
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

  if (isNotionalLessThanMinNotional.value) {
    return true
  }

  if (spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit) {
    return !spotFormValues.value[SpotTradeFormField.Price]
  }
})

onMounted(() => {
  useEventBus<ChartViewOption>(BusEvents.UpdateMarketChart).on((chart) => {
    chartType.value = chart
  })
})

const mixPanelFields = computed(() => ({
  isAutoSign: sharedWalletStore.isAutoSignEnabled,
  isBuy: isBuy.value,
  market: market.value.slug,
  marketType: SharedMarketType.Spot,
  amount: props.quantity.toFixed(),
  leverage: '',
  triggerPrice: '',
  slippageTolerance: spotFormValues.value[SpotTradeFormField.Slippage] || '',
  postOnly: !!spotFormValues.value[SpotTradeFormField.PostOnly],
  chartType: chartType.value
}))

function submitLimitOrder() {
  status.setLoading()

  const limitPrice = new BigNumberInBase(
    spotFormValues.value[SpotTradeFormField.Price] || 0
  )

  let err: Error
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
    })
    .catch((e) => {
      err = e
      $onError(e)
    })
    .finally(() => {
      EventTracker.trackCreateOrder(
        {
          ...mixPanelFields.value,
          orderType: MixPanelOrderType.Limit,
          limitPrice: limitPrice.toFixed()
        },
        err?.message
      )

      status.setIdle()
    })
}

function submitMarketOrder() {
  status.setLoading()

  let err: Error
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
    })
    .catch((e) => {
      err = e
      $onError(e)
    })
    .finally(() => {
      EventTracker.trackCreateOrder(
        {
          ...mixPanelFields.value,
          orderType: MixPanelOrderType.Market,
          limitPrice: ''
        },
        err?.message
      )

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
