<script lang="ts" setup>
import { SharedMarketType } from '@shared/types'
import { SpotLimitOrder, DerivativeLimitOrder } from '@injectivelabs/sdk-ts'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { getChronosDatafeedEndpoint } from '@/app/utils/helpers'
import {
  UiSpotMarket,
  UiMarketWithToken,
  UiDerivativeMarket,
  TradingChartInterval
} from '@/types'

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

const limitOrders = computed(() =>
  [...spotStore.subaccountOrders, ...derivativeStore.subaccountOrders].filter(
    (order) => order.marketId === props.market.marketId
  )
)

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

function onLimitPriceChange({
  order,
  newPrice
}: {
  newPrice: number
  order: SpotLimitOrder | DerivativeLimitOrder
}) {
  orderStatus.setLoading()

  if (props.isSpot) {
    spotStore
      .submitChase({
        order: order as SpotLimitOrder,
        price: new BigNumberInBase(newPrice),
        market: props.market as UiSpotMarket
      })
      .then(() => notificationStore.success({ title: t('trade.orderUpdated') }))
      .catch($onError)
      .finally(() => orderStatus.setIdle())

    return
  }

  derivativeStore
    .submitChase({
      order: order as DerivativeLimitOrder,
      price: new BigNumberInBase(newPrice),
      market: props.market as UiDerivativeMarket
    })
    .then(() => notificationStore.success({ title: t('trade.orderUpdated') }))
    .catch($onError)
    .finally(() => orderStatus.setIdle())
}

function onLimitOrderClose(order: SpotLimitOrder | DerivativeLimitOrder) {
  orderStatus.setLoading()

  if (props.isSpot) {
    spotStore
      .cancelOrder(order as SpotLimitOrder)
      .then(() => {
        notificationStore.success({ title: t('trade.order_success_canceling') })
      })
      .catch($onError)
      .finally(() => orderStatus.setIdle())

    return
  }

  derivativeStore
    .cancelOrder(order as DerivativeLimitOrder)
    .then(() =>
      notificationStore.success({ title: t('trade.order_success_canceling') })
    )
    .catch($onError)
    .finally(() => orderStatus.setIdle())
}
</script>

<template>
  <div class="h-full relative">
    <AppHocLoading v-bind="{ status }" is-helix />
    <ClientOnly>
      <AppHocLoading v-bind="{ status: orderStatus }" is-helix>
        <PartialsTradingMarketChartTradingView
          v-show="status.isNotLoading()"
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
          @interval:change="onIntervalChange"
          @limit-price:change="onLimitPriceChange"
          @order:close="onLimitOrderClose"
        />
      </AppHocLoading>
    </ClientOnly>
  </div>
</template>
