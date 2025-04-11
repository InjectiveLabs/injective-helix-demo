<script lang="ts" setup>
import { SharedMarketType } from '@shared/types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import type {
  SpotLimitOrder,
  DerivativeLimitOrder
} from '@injectivelabs/sdk-ts'
import { getChronosDatafeedEndpoint } from '@/app/utils/helpers'
import type {
  UiSpotMarket,
  UiMarketWithToken,
  UiDerivativeMarket
} from '@/types'
import { TradingChartInterval } from '@/types'

const appStore = useAppStore()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    isSpot: boolean
    market: UiMarketWithToken
  }>(),
  {}
)

const isSpot = props.market.type === SharedMarketType.Spot

const tradingChartComponent = ref()
const status = reactive(new Status(StatusType.Loading))
const orderStatus = reactive(new Status(StatusType.Idle))

const symbol = computed(() => {
  if (!isSpot) {
    return props.market.ticker
  }

  return `${(props.market as UiSpotMarket).baseDenom}/${
    (props.market as UiSpotMarket).quoteDenom
  }`
})

const datafeedEndpoint = computed(() =>
  getChronosDatafeedEndpoint(
    props.market.type === SharedMarketType.Derivative ? 'derivative' : 'spot'
  )
)

const limitOrders = computed(() => {
  const ordersData = isSpot
    ? spotStore.subaccountOrders
    : derivativeStore.subaccountOrders

  return ordersData.filter((order) => order.marketId === props.market.marketId)
})

function onReady() {
  status.setIdle()
}

function onIntervalChange(value: TradingChartInterval) {
  appStore.setUserState({
    ...appStore.userState,
    preferences: {
      ...appStore.userState.preferences,
      tradingChartInterval: value
    }
  })
}

function onOrderChange({
  price,
  quantity,
  newPrice
}: {
  price: string
  quantity: string
  newPrice: string
}) {
  orderStatus.setLoading()

  const orders = isSpot
    ? spotStore.subaccountOrders
    : derivativeStore.subaccountOrders

  const order = orders.find(
    (order) => order.price === price && order.quantity === quantity
  )

  if (!order) {
    console.log('order not found!')

    return
  }

  if (props.isSpot) {
    spotStore
      .submitChase({
        order: order as SpotLimitOrder,
        price: new BigNumberInBase(newPrice),
        market: props.market as UiSpotMarket
      })
      .then(() => notificationStore.success({ title: t('trade.orderUpdated') }))
      .catch((e) => {
        $onError(e)
      })
      .finally(() => {
        orderStatus.setIdle()
        tradingChartComponent.value?.modifyLimitOrderLines()
      })
  } else {
    derivativeStore
      .submitChase({
        order: order as DerivativeLimitOrder,
        price: new BigNumberInBase(newPrice),
        market: props.market as UiDerivativeMarket
      })
      .then(() => notificationStore.success({ title: t('trade.orderUpdated') }))
      .catch((e) => {
        $onError(e)
      })
      .finally(() => {
        orderStatus.setIdle()
        tradingChartComponent.value?.modifyLimitOrderLines()
      })
  }
}

function onOrderClose({
  price,
  quantity
}: {
  price: string
  quantity: string
}) {
  orderStatus.setLoading()

  const orders = isSpot
    ? spotStore.subaccountOrders
    : derivativeStore.subaccountOrders

  const order = orders.find(
    (order) => order.price === price && order.quantity === quantity
  )

  if (!order) {
    console.log('order not found!')

    return
  }

  if (props.isSpot) {
    spotStore
      .cancelOrder(order as SpotLimitOrder)
      .then(() => {
        notificationStore.success({ title: t('trade.order_success_canceling') })
      })
      .catch((e) => {
        $onError(e)

        tradingChartComponent.value?.modifyLimitOrderLines()
      })
      .finally(() => orderStatus.setIdle())
  } else {
    derivativeStore
      .cancelOrder(order as DerivativeLimitOrder)
      .then(() =>
        notificationStore.success({ title: t('trade.order_success_canceling') })
      )
      .catch((e) => {
        $onError(e)

        tradingChartComponent.value?.modifyLimitOrderLines()
      })
      .finally(() => orderStatus.setIdle())
  }
}
</script>

<template>
  <div class="h-full relative">
    <ClientOnly>
      <PartialsTradingMarketChartTradingView
        v-show="status.isNotLoading()"
        ref="tradingChartComponent"
        v-bind="{
          symbol: symbol,
          isSpot: isSpot,
          market: market,
          datafeedEndpoint,
          orders: limitOrders,
          interval:
            appStore.userState.preferences.tradingChartInterval ||
            TradingChartInterval.D
        }"
        @ready="onReady"
        @order:close="onOrderClose"
        @order:change="onOrderChange"
        @interval:change="onIntervalChange"
      />
    </ClientOnly>
  </div>
</template>
