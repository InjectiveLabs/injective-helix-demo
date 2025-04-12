<script setup lang="ts">
import { SharedMarketType } from '@shared/types'
import { MsgType, OrderSide } from '@injectivelabs/ts-types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import {
  Modal,
  BusEvents,
  MarketKey,
  TradeTypes,
  ChartViewOption,
  MixPanelOrderType,
  SpotTradeFormField
} from '@/types'
import type { UiSpotMarket, SpotTradeForm } from '@/types'

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const formErrors = useFormErrors()
const validate = useValidateForm()
const jsonStore = useSharedJsonStore()
const modalStore = useSharedModalStore()
const resetForm = useResetForm<SpotTradeForm>()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const market = inject(MarketKey) as Ref<UiSpotMarket>

const { isLimitOrder, hasEnoughLiquidity, isNotionalLessThanMinNotional } =
  useSpotWorstPrice(market)

const props = withDefaults(
  defineProps<{
    quantity: BigNumberInBase
    worstPrice: BigNumberInBase
  }>(),
  {}
)

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
      [SpotTradeFormField.Slippage]:
        spotFormValues.value[SpotTradeFormField.Slippage],
      [SpotTradeFormField.AmountOption]:
        spotFormValues.value[SpotTradeFormField.AmountOption]
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

const isDisabled = computed(() => {
  if (!isLimitOrder.value && jsonStore.isPostUpgradeMode) {
    return true
  }

  if (Object.keys(formErrors.value).length > 0) {
    return true
  }

  if (!spotFormValues.value[SpotTradeFormField.Amount]) {
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

  return (
    !spotFormValues.value[SpotTradeFormField.Price] &&
    spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
  )
})

onMounted(() => {
  useEventBus<ChartViewOption>(BusEvents.UpdateMarketChart).on((chart) => {
    chartType.value = chart
  })
})

const mixPanelFields = computed(() => ({
  leverage: '',
  triggerPrice: '',
  isBuy: isBuy.value,
  market: market.value.slug,
  chartType: chartType.value,
  amount: props.quantity.toFixed(),
  marketType: SharedMarketType.Spot,
  isAutoSign: sharedWalletStore.isAutoSignEnabled,
  postOnly: !!spotFormValues.value[SpotTradeFormField.PostOnly],
  slippageTolerance: spotFormValues.value[SpotTradeFormField.Slippage] || ''
}))

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
          orderType: MixPanelOrderType.Market
        },
        err?.message
      )

      status.setIdle()
    })
}

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
          limitPrice: limitPrice.toFixed(),
          orderType: MixPanelOrderType.Limit
        },
        err?.message
      )

      status.setIdle()
    })
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
      <span v-if="!isAuthorized">
        {{ $t('common.unauthorized') }}
      </span>

      <span v-else-if="!hasEnoughLiquidity">
        {{ $t('trade.swap.insufficient_liquidity') }}
      </span>

      <span v-else>
        {{ $t(`trade.${isBuy ? 'buy' : 'sell'}`) }}
      </span>
    </AppButton>

    <p
      v-if="!isLimitOrder && jsonStore.isPostUpgradeMode"
      class="text-orange-500 text-xs mt-2"
    >
      {{ $t('trade.postOnlyWarning') }}
    </p>
  </div>
</template>
