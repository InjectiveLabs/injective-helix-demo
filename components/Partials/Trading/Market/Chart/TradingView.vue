<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import config from '@/app/trading-view/config'
import { widget as TradingViewWidget } from '@/assets/js/chart/charting_library.esm'
import {
  CHART_ZOOM_FALLBACK_NUMBER,
  DEFAULT_100_CHART_CANDLE_BAR_SPACING,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  BusEvents,
  TradingInterface,
  TradingChartInterval,
  ConditionalOrderSide
} from '@/types'
import type {
  UiTrade,
  UiSpotMarket,
  UiDerivativeMarket,
  ChartPosition
} from '@/types'
import type { SharedUiSpotTrade, SharedUiDerivativeTrade } from '@shared/types'
import type {
  SpotLimitOrder,
  DerivativeLimitOrder
} from '@injectivelabs/sdk-ts'

const route = useRoute()
const appStore = useAppStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()
const { t } = useLang()

const props = withDefaults(
  defineProps<{
    symbol: string
    isSpot: boolean
    interval: string
    datafeedEndpoint: string
    historicalTrades: UiTrade[]
    currentMarketPosition?: ChartPosition
    market: UiSpotMarket | UiDerivativeMarket
    orders?: SpotLimitOrder[] | DerivativeLimitOrder[]
  }>(),
  { orders: () => [] }
)

const emit = defineEmits<{
  ready: []
  'interval:change': [value: TradingChartInterval]
  'order:close': [
    {
      order: SpotLimitOrder | DerivativeLimitOrder
    }
  ]
  'order:change': [
    {
      newPrice: string
      order: SpotLimitOrder | DerivativeLimitOrder
    }
  ]
}>()

const containerId = `tv_chart_container-${window.crypto
  .getRandomValues(new Uint32Array(1))[0]
  .toString()}`

const tpOrderline = ref()
const slOrderline = ref()
const positionLine = ref()
const widgetOptions = ref<any>({})
const setPositionLineInterval = ref()
const isFromSubaccountTradeStream = ref(false)
const limitOrderLines = ref<Record<string, any>>({})
const tradingView = ref<{ view: any }>({ view: undefined })

const showTradeHistory = computed({
  get: () => true,
  set: (value) => {
    if (!value) {
      clearLimitOrderlines()
      setupTpOrderline(true)
      setupSlOrderline(true)
      setupPositionLine(true)
      setupChartMarkers(true)
    } else {
      setupTpOrderline()
      setupSlOrderline()
      setupPositionLine()
      setupChartMarkers()
      modifyLimitOrderLines()
    }
  }
})

const tpOrder = computed(() =>
  derivativeStore.subaccountConditionalOrders.find(
    (order) =>
      (order.orderType === ConditionalOrderSide.TakeBuy ||
        order.orderType === ConditionalOrderSide.TakeSell) &&
      order.marketId === props.currentMarketPosition?.marketId
  )
)

const slOrder = computed(() =>
  derivativeStore.subaccountConditionalOrders.find(
    (order) =>
      (order.orderType === ConditionalOrderSide.StopBuy ||
        order.orderType === ConditionalOrderSide.StopSell) &&
      order.marketId === props.currentMarketPosition?.marketId
  )
)

watch(() => props.orders, modifyLimitOrderLines, { deep: true })

watch(
  () => props.historicalTrades,
  () => setupChartMarkers()
)

watch(
  () => tpOrder.value,
  () => setupTpOrderline(),
  { deep: true }
)

watch(
  () => tpOrder.value,
  () => setupSlOrderline(),
  { deep: true }
)

onMounted(() => {
  widgetOptions.value = config({
    containerId,
    symbol: props.symbol,
    interval: props.interval,
    datafeedEndpoint: props.datafeedEndpoint
  })

  const tradingWidget = new TradingViewWidget(widgetOptions.value as any)

  tradingWidget.onChartReady(() => {
    tradingWidget.applyOverrides(widgetOptions.value.overrides)
    const tradingViewChart = tradingWidget?.chart()

    nextTick(() => {
      tradingView.value.view = tradingWidget
      setupTpOrderline()
      setupSlOrderline()
      modifyLimitOrderLines()
    })

    tradingViewChart
      .onIntervalChanged()
      .subscribe(null, (selectedInterval: TradingChartInterval) => {
        if (
          selectedInterval === props.interval ||
          selectedInterval === TradingChartInterval['1m']
        ) {
          return
        }

        setupChartMarkers(false, selectedInterval)
        emit('interval:change', selectedInterval)
      })

    if (tradingViewChart) {
      setTimeout(() => {
        tradingViewChart.setBarSpacing(
          appStore.userState.preferences.chartZoomPreference ||
            DEFAULT_100_CHART_CANDLE_BAR_SPACING
        )

        tradingViewChart.onVisibleRangeChanged().subscribe(null, () => {
          const zoomRange =
            tradingViewChart.getTimeScale()?.barSpacing() ||
            DEFAULT_100_CHART_CANDLE_BAR_SPACING

          const isTradingViewDefaultZoomConfig =
            zoomRange === CHART_ZOOM_FALLBACK_NUMBER

          if (isTradingViewDefaultZoomConfig) {
            tradingViewChart.setBarSpacing(
              appStore.userState.preferences.chartZoomPreference ||
                DEFAULT_100_CHART_CANDLE_BAR_SPACING
            )
          } else {
            appStore.setChartZoomPreference(zoomRange)
          }
        })

        setupChartMarkers()
        setupPositionLine()

        emit('ready')
      }, 100)
    }
  })

  useEventBus(BusEvents.SubaccountTradeStreamResponded).on(() => {
    isFromSubaccountTradeStream.value = true

    setTimeout(() => {
      isFromSubaccountTradeStream.value = false
    }, 1000)
  })
})

function setupPositionLine(isHide?: boolean) {
  setupPositionLineInChart(isHide)

  if (isHide) {
    clearInterval(setPositionLineInterval.value)
    setPositionLineInterval.value = undefined

    return
  }

  setPositionLineInterval.value = setInterval(
    () => setupPositionLineInChart(),
    5 * 1000
  )
}

async function setupPositionLineInChart(isHide?: boolean) {
  const tradingViewChart = tradingView.value?.view?.chart()

  if (!props.currentMarketPosition) {
    return
  }

  const pnl = props.currentMarketPosition?.pnl || ZERO_IN_BASE
  const formattedPnl = pnl?.isNegative()
    ? `- $${pnl.abs().toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS, BigNumberInBase.ROUND_DOWN)}`
    : pnl.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS, BigNumberInBase.ROUND_DOWN)

  const formattedEntryPrice = sharedToBalanceInTokenInBase({
    value: props.currentMarketPosition.entryPrice,
    decimalPlaces: props.market.quoteToken.decimals
  }).toFixed(props.market.priceDecimals, BigNumberInBase.ROUND_DOWN)

  if (!positionLine.value) {
    positionLine.value = await tradingViewChart.createPositionLine()

    positionLine.value
      .setLineStyle(2)
      .setExtendLeft(true)
      .setPrice(formattedEntryPrice)
      .setText(`${t('common.pnl')} ${formattedPnl}`)
      .setQuantity(`${props.currentMarketPosition?.percentagePnl}%`)
      .setLineColor('#40A9FF')
      .setBodyTextColor('#40A9FF')
      .setBodyBorderColor('#40A9FF')
      .setBodyBackgroundColor('#14151A')
      .setQuantityBorderColor('#40A9FF')
      .setQuantityBackgroundColor('#14151A')

    return
  } else if (isHide) {
    positionLine.value?.remove()
    positionLine.value = undefined

    return
  }

  positionLine.value
    .setPrice(formattedEntryPrice)
    .setText(`PNL ${formattedPnl}`)
    .setQuantity(`${props.currentMarketPosition?.percentagePnl}%`)
}

function setupChartMarkers(isHide?: boolean, interval?: TradingChartInterval) {
  const tradingViewChart = tradingView.value?.view?.chart()

  const intervalToSeconds = Object.values(TradingChartInterval).reduce(
    (intervalSecondsMap, value) => {
      if (value === TradingChartInterval.D) {
        intervalSecondsMap[value] = 24 * 60 * 60
      } else if (value === TradingChartInterval.W) {
        intervalSecondsMap[value] = 7 * 24 * 60 * 60
      } else {
        intervalSecondsMap[value] = parseInt(value) * 60
      }

      return intervalSecondsMap
    },
    {} as Record<string, number>
  )

  if (tradingViewChart && !isFromSubaccountTradeStream.value) {
    const selectedInterval = interval || props.interval
    const balancer = intervalToSeconds[selectedInterval]
    const isDayInterval = selectedInterval === TradingChartInterval.D

    const filteredTrades = Object.values(
      props.historicalTrades.reduce(
        (tradeList, originalTrade) => {
          const trade = { ...originalTrade }

          const localTimezoneSeconds = isDayInterval
            ? -new Date().getTimezoneOffset() * 60
            : 0
          const time =
            Math.floor(trade.executedAt / 1000) + localTimezoneSeconds

          // ensure to show the last buy + sell markers
          const extra = trade.tradeDirection === TradeDirection.Sell ? 1 : 0
          const groupedTime = Math.floor(time / balancer) * balancer + extra

          if (!tradeList[groupedTime]) {
            trade.executedAt = groupedTime
            tradeList[groupedTime] = trade
          }

          return tradeList
        },
        {} as Record<number, UiTrade>
      )
    )

    const customMarks = filteredTrades.map((trade) => {
      const time = trade.executedAt

      const price = props.isSpot
        ? new BigNumberInBase((trade as SharedUiSpotTrade).price).toWei(
            props.market.baseToken.decimals - props.market.quoteToken.decimals
          )
        : sharedToBalanceInTokenInBase({
            value: (trade as SharedUiDerivativeTrade).executionPrice,
            decimalPlaces: props.market.quoteToken.decimals
          })

      const formattedPrice = new BigNumberInBase(price)
        .toFixed(props.market.priceDecimals)
        .replace(/\.?0+$/, '')

      const isBuy = trade.tradeDirection === TradeDirection.Buy
      const label = isBuy ? 'B' : 'S'
      const color = isBuy ? '#43E2AC' : '#FF8080'

      return {
        time,
        label,
        minSize: 16,
        borderWidth: 0,
        id: trade.tradeId,
        labelFontColor: '#14151A',
        text: `${isBuy ? t('trade.bought') : t('trade.sold')} ${props.market.baseToken.symbol} at ${formattedPrice}`,
        color: {
          border: color,
          background: color
        }
      }
    })

    widgetOptions.value.datafeed.getMarks = (
      symbolInfo: any,
      from: string,
      to: string,
      onDataCallback: (marks: Record<string, any>) => void
    ) => {
      const updatedMarks = isHide ? [] : customMarks
      onDataCallback(updatedMarks)
    }

    // ensure markers process doesn't clash with orderline process
    setTimeout(() => {
      triggerMarkersUpdate()
    }, 300)
  }
}

function triggerMarkersUpdate() {
  const tradingViewChart = tradingView.value?.view?.chart()

  tradingViewChart.setResolution(TradingChartInterval['1m'])
  tradingViewChart.setResolution(props.interval)

  const timeScale = tradingViewChart.getTimeScale()

  if (timeScale) {
    const originalSpacing = timeScale.barSpacing()

    timeScale.setBarSpacing(originalSpacing + 1)
    timeScale.setBarSpacing(originalSpacing)
  }
}

function clearLimitOrderlines() {
  Object.values(limitOrderLines.value).forEach((orderLine) => {
    nextTick(() => {
      toRaw(orderLine).remove()
    })
  })

  limitOrderLines.value = {}
}

function modifyLimitOrderLines() {
  if (!showTradeHistory.value) {
    return
  }

  nextTick(() => {
    const updatedOrderLinesId: string[] = []
    const chart = tradingView.value.view?.chart()

    clearLimitOrderlines()

    if (!chart || route.query?.interface === TradingInterface.TradingBots) {
      return
    }

    props.orders?.forEach((order) => {
      const formattedPrice = (
        props.isSpot
          ? sharedToBalanceInWei({
              value: order.price,
              decimalPlaces:
                props.market.baseToken.decimals -
                props.market.quoteToken.decimals
            })
          : sharedToBalanceInTokenInBase({
              value: order.price,
              decimalPlaces: props.market.quoteToken.decimals
            })
      ).toFixed(props.market.priceDecimals)

      const formattedUnfilledQuantity = (
        props.isSpot
          ? new BigNumberInWei(order.unfilledQuantity).toBase(
              (props.market as UiSpotMarket).baseToken.decimals
            )
          : new BigNumberInBase(order.unfilledQuantity)
      ).toFixed(props.market.quantityDecimals)

      const uid = order.orderHash || order.cid
      const orderLine = chart.createOrderLine({ disableUndo: true })

      const themeColor = (
        [OrderSide.Buy, OrderSide.BuyPO] as OrderSide[]
      ).includes(order.orderSide)
        ? '#0EE29B'
        : '#F3164D'

      orderLine
        .setLineStyle(2)
        .setPrice(formattedPrice)
        .setLineColor(themeColor)
        .setBodyTextColor(themeColor)
        .setBodyBorderColor(themeColor)
        .setBodyBackgroundColor('#14151A')
        .setQuantityBorderColor(themeColor)
        .setQuantityBackgroundColor('#14151A')
        .setCancelButtonIconColor(themeColor)
        .setCancelButtonBorderColor(themeColor)
        .setCancelButtonBackgroundColor('#14151A')
        .setQuantity(
          `${formattedUnfilledQuantity} ${props.market?.baseToken?.symbol}`
        )
        .setText(
          `${t('trade.limit')} ${t(
            `trade.${order.orderSide}`
          ).toUpperCase()} @ ${formattedPrice}`
        )

      orderLine.onMove?.(() => {
        const newPrice = orderLine.getPrice()

        orderLine.setText(
          `${t('trade.limit')} ${t(
            `trade.${order.orderSide}`
          ).toUpperCase()} @ ${newPrice.toFixed(props.market.priceDecimals)}`
        )

        delete limitOrderLines.value[uid]

        emit('order:change', {
          order,
          newPrice
        })

        // temp orderline
        limitOrderLines.value[`${newPrice}-${order.quantity}`] = orderLine
        orderLine.setCancellable(false)
        orderLine.setCancelButtonIconColor('#14151A')
      })

      orderLine.onCancel?.(() => {
        emit('order:close', {
          order
        })

        toRaw(orderLine).remove()
        delete limitOrderLines.value[uid]
      })

      limitOrderLines.value[uid] = orderLine
      updatedOrderLinesId.push(uid)
    })
  })
}

function setupTpOrderline(isHide?: boolean) {
  setupTpSlBaseOrderline(isHide, true)
}

function setupSlOrderline(isHide?: boolean) {
  setupTpSlBaseOrderline(isHide)
}

function setupTpSlBaseOrderline(isHide?: boolean, isTakeProfit?: boolean) {
  nextTick(() => {
    const chart = tradingView.value.view?.chart()

    if (!chart) {
      return
    }

    const selectedOrder = isTakeProfit ? tpOrder.value : slOrder.value
    const selectedOrderline = isTakeProfit
      ? tpOrderline.value
      : slOrderline.value

    const formattedTriggerPrice = sharedToBalanceInTokenInBase({
      value: selectedOrder?.triggerPrice || '0',
      decimalPlaces: props.market.quoteToken.decimals
    }).toFixed(props.market.priceDecimals)

    const formattedUnfilledQuantity = new BigNumberInBase(
      selectedOrder?.quantity || '0'
    ).toFixed(props.market.quantityDecimals)

    const tpSlText = isTakeProfit
      ? `${t('trade.tpPrice')} >`
      : `${t('trade.slPrice')} <`

    console.log({ selectedOrder, selectedOrderline })

    if (isHide || (!selectedOrder && selectedOrderline)) {
      toRaw(selectedOrderline).remove()

      if (isTakeProfit) {
        tpOrderline.value = undefined
        return
      }

      slOrderline.value = undefined

      return
    } else if (selectedOrderline) {
      selectedOrderline
        .setPrice(formattedTriggerPrice)
        .setText(`${tpSlText} ${formattedTriggerPrice}`)
        .setQuantity(
          `${formattedUnfilledQuantity} ${props.market?.baseToken?.symbol}`
        )

      return
    }

    const orderLine = chart.createOrderLine({ disableUndo: true })

    const themeColor =
      props.currentMarketPosition?.direction === TradeDirection.Long
        ? '#F3164D'
        : '#0EE29B'

    orderLine
      .setLineStyle(2)
      .setPrice(formattedTriggerPrice)
      .setLineColor(themeColor)
      .setBodyTextColor(themeColor)
      .setBodyBorderColor(themeColor)
      .setBodyBackgroundColor('#14151A')
      .setQuantityBorderColor(themeColor)
      .setQuantityBackgroundColor('#14151A')
      .setCancelButtonIconColor(themeColor)
      .setCancelButtonBorderColor(themeColor)
      .setCancelButtonBackgroundColor('#14151A')
      .setText(`${tpSlText} ${formattedTriggerPrice}`)
      .setQuantity(
        `${formattedUnfilledQuantity} ${props.market?.baseToken?.symbol}`
      )

    orderLine.onCancel?.(() => {
      // todo fred: when alpha sprint begins
      // emit('tp:close', {
      //   order
      // })

      toRaw(orderLine).remove()

      if (isTakeProfit) {
        delete tpOrderline.value
        return
      }

      delete slOrderline.value
    })

    if (isTakeProfit) {
      tpOrderline.value = undefined
      return
    }

    slOrderline.value = undefined
  })
}

defineExpose({ modifyLimitOrderLines })
</script>

<template>
  <div class="relative w-full h-full">
    <AppCheckbox
      v-if="sharedWalletStore.isUserConnected"
      v-model="showTradeHistory"
      v-bind="{ isReverse: true }"
      class="absolute top-1 right-[155px] flex-row-reverse max-2xl:hidden"
    >
      <span class="text-sm leading-4 font-proximaNova">
        {{ $t('trade.showOrders') }}
      </span>
    </AppCheckbox>

    <div
      :id="containerId"
      ref="tradingView"
      class="tv_chart_container w-full h-full"
    />
  </div>
</template>
