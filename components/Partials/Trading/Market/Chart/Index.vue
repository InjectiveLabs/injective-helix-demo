<script lang="ts" setup>
import { SharedMarketType } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  MAX_LIMIT_ORDER_LINES,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { getChronosDatafeedEndpoint } from '@/app/utils/helpers'
import { calculateScaledMarkPrice } from '@/app/client/utils/derivatives'
import { TradingChartInterval } from '@/types'
import type {
  SpotLimitOrder,
  DerivativeLimitOrder
} from '@injectivelabs/sdk-ts'
import type {
  UiSpotMarket,
  UiMarketWithToken,
  UiDerivativeMarket,
  ChartPosition
} from '@/types'

const appStore = useAppStore()
const spotStore = useSpotStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
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

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)

const { markPrice: derivativeMarkPrice } = useDerivativeLastPrice(
  computed(() => props.market)
)

const isSpot = props.market.type === SharedMarketType.Spot

const tradingChartComponent = ref()
const status = reactive(new Status(StatusType.Loading))

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

const priceReference = computed(
  () =>
    new BigNumberInBase(
      isSpot ? spotLastTradedPrice.value : derivativeMarkPrice.value
    )
)

const limitOrders = computed(() => {
  const ordersData = isSpot
    ? spotStore.subaccountOrders
    : derivativeStore.subaccountOrders

  const filteredOrders = ordersData.filter(
    (order) => order.marketId === props.market.marketId
  )

  const buyOrders = filteredOrders
    .filter((order) =>
      ([OrderSide.Buy, OrderSide.BuyPO] as OrderSide[]).includes(
        order.orderSide
      )
    )
    .sort((a, b) => {
      const aPrice = getFormattedPriceInBigNumber(a.price)
      const bPrice = getFormattedPriceInBigNumber(b.price)

      return (
        aPrice.minus(priceReference.value).abs().toNumber() -
        bPrice.minus(priceReference.value).abs().toNumber()
      )
    })
    .slice(0, MAX_LIMIT_ORDER_LINES)

  const sellOrders = filteredOrders
    .filter((order) =>
      ([OrderSide.Sell, OrderSide.SellPO] as OrderSide[]).includes(
        order.orderSide
      )
    )
    .sort((a, b) => {
      const aPrice = getFormattedPriceInBigNumber(a.price)
      const bPrice = getFormattedPriceInBigNumber(b.price)

      return (
        aPrice.minus(priceReference.value).abs().toNumber() -
        bPrice.minus(priceReference.value).abs().toNumber()
      )
    })
    .slice(0, MAX_LIMIT_ORDER_LINES)

  return buyOrders.concat(sellOrders)
})

const historicalTrades = computed(() => {
  const tradesData = isSpot
    ? spotStore.subaccountTrades
    : derivativeStore.subaccountTrades

  return tradesData.filter((trade) => trade.marketId === props.market.marketId)
})

const currentMarketPosition = computed<ChartPosition | undefined>(() => {
  if (props.isSpot) {
    return undefined
  }

  const currentPosition = positionStore.positions.find(
    (position) =>
      position.marketId === props.market.marketId &&
      position.subaccountId === accountStore.subaccountId
  )

  const market = derivativeStore.marketByIdOrSlug(
    currentPosition?.marketId || ''
  )

  if (!market || !currentPosition) {
    return undefined
  }

  const markPriceFromStream =
    derivativeStore.marketMarkPriceMap[market.marketId]

  const markPriceNotScaled = markPriceFromStream
    ? new BigNumberInBase(markPriceFromStream.price)
    : sharedToBalanceInTokenInBase({
        value: currentPosition.markPrice,
        decimalPlaces: market.quoteToken.decimals
      })

  const markPrice = calculateScaledMarkPrice({
    market,
    markPriceNotScaled
  })

  const price = sharedToBalanceInTokenInBase({
    value: currentPosition.entryPrice,
    decimalPlaces: market.quoteToken.decimals
  })

  const margin = sharedToBalanceInTokenInBase({
    value: currentPosition.margin,
    decimalPlaces: market.quoteToken.decimals
  })

  const pnl = new BigNumberInBase(currentPosition.quantity)
    .times(markPrice.minus(price))
    .times(currentPosition.direction === TradeDirection.Long ? 1 : -1)

  const percentagePnl = pnl.isNaN()
    ? '0'
    : new BigNumberInBase(pnl.dividedBy(margin).times(100)).toFixed(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )

  return {
    ...currentPosition,
    pnl,
    percentagePnl
  }
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

function getFormattedPriceInBigNumber(price: string) {
  const spotPrice = sharedToBalanceInWei({
    value: price,
    decimalPlaces:
      props.market.baseToken.decimals - props.market.quoteToken.decimals
  })

  const derivativePrice = sharedToBalanceInTokenInBase({
    value: price,
    decimalPlaces: props.market.quoteToken.decimals
  })

  return isSpot ? spotPrice : derivativePrice
}

function onOrderClose({
  order
}: {
  order: SpotLimitOrder | DerivativeLimitOrder
}) {
  const action = props.isSpot
    ? () => spotStore.cancelOrder(order as SpotLimitOrder)
    : () => derivativeStore.cancelOrder(order as DerivativeLimitOrder)

  action()
    .then(() => {
      notificationStore.update({
        title: t('toast.trade.orderCancelled')
      })
    })
    .catch((e) => {
      $onError(e)
      tradingChartComponent.value?.modifyLimitOrderLines()
    })
}

function onOrderChange({
  order,
  newPrice
}: {
  newPrice: string
  order: SpotLimitOrder | DerivativeLimitOrder
}) {
  const isBuy = ([OrderSide.Buy, OrderSide.BuyPO] as OrderSide[]).includes(
    order.orderSide
  )

  const isInvalidPrice =
    (isBuy && priceReference.value.lte(newPrice)) ||
    (!isBuy && priceReference.value.gte(newPrice))

  if (isInvalidPrice) {
    notificationStore.error({
      title: t('toast.trade.invalidPrice')
    })

    tradingChartComponent.value?.modifyLimitOrderLines()

    return
  }

  const action = props.isSpot
    ? () =>
        spotStore.submitChase({
          order: order as SpotLimitOrder,
          price: new BigNumberInBase(newPrice),
          market: props.market as UiSpotMarket
        })
    : () =>
        derivativeStore.submitChase({
          order: order as DerivativeLimitOrder,
          price: new BigNumberInBase(newPrice),
          market: props.market as UiDerivativeMarket
        })

  action()
    .then(() =>
      notificationStore.update({ title: t('toast.trade.orderUpdated') })
    )
    .catch((e) => {
      $onError(e)
      tradingChartComponent.value?.modifyLimitOrderLines()
    })
}
</script>

<template>
  <div ref="trading-view-wrap" class="h-full relative">
    <AppHocLoading v-bind="{ status }" is-helix />

    <ClientOnly>
      <PartialsTradingMarketChartTradingView
        v-show="status.isNotLoading()"
        ref="tradingChartComponent"
        v-bind="{
          symbol,
          isSpot,
          market,
          datafeedEndpoint,
          historicalTrades,
          orders: limitOrders,
          currentMarketPosition,
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
