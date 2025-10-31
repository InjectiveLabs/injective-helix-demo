<script lang="ts" setup>
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import config from '@/app/trading-view/config'
import { widget as TradingViewWidget } from '@/assets/js/chart/charting_library.esm'
import {
  DEBOUNCE_DEFAULT_PERIOD,
  CHART_ZOOM_FALLBACK_NUMBER,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  DEFAULT_100_CHART_CANDLE_BAR_SPACING
} from '@/app/utils/constants'
import {
  BusEvents,
  TradingInterface,
  TradingChartInterval,
  ConditionalOrderSide
} from '@/types'
import type { UiTrade, UiSpotMarket, UiDerivativeMarket } from '@/types'
import type { SharedUiSpotTrade, SharedUiDerivativeTrade } from '@shared/types'
import type {
  PositionV2,
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
    currentPosition?: PositionV2
    derivativeMarkPrice?: string
    market: UiSpotMarket | UiDerivativeMarket
    orders?: SpotLimitOrder[] | DerivativeLimitOrder[]
  }>(),
  { orders: () => [] }
)

const emit = defineEmits<{
  ready: []
  'interval:change': [value: TradingChartInterval]
  'order:close': [{ order: SpotLimitOrder | DerivativeLimitOrder }]
  'tp-sl:cancel': [{ isTp: boolean; order: DerivativeLimitOrder | undefined }]
  'order:change': [
    {
      newPrice: string
      order: SpotLimitOrder | DerivativeLimitOrder
    }
  ]
}>()

const { pnl } = useDerivativePosition(computed(() => props.currentPosition))

const containerId = `tv_chart_container-${window.crypto
  .getRandomValues(new Uint32Array(1))[0]
  .toString()}`

const tpOrderline = ref()
const slOrderline = ref()
const positionLine = ref()
const widgetOptions = ref<any>({})
const showTradeHistory = ref(true)
const isFromSubaccountTradeStream = ref(false)
const limitOrderLines = ref<Record<string, any>>({})
const tradingView = ref<{ view: any }>({ view: undefined })

const tpOrder = computed(() =>
  derivativeStore.subaccountConditionalOrders.find(
    (order) =>
      order.marketId === props.currentPosition?.marketId &&
      (order.orderType === ConditionalOrderSide.TakeBuy ||
        order.orderType === ConditionalOrderSide.TakeSell)
  )
)

const slOrder = computed(() =>
  derivativeStore.subaccountConditionalOrders.find(
    (order) =>
      order.marketId === props.currentPosition?.marketId &&
      (order.orderType === ConditionalOrderSide.StopBuy ||
        order.orderType === ConditionalOrderSide.StopSell)
  )
)

watchDebounced(() => props.orders, modifyLimitOrderLines, {
  immediate: true,
  debounce: DEBOUNCE_DEFAULT_PERIOD
})

watchDebounced(() => props.derivativeMarkPrice, setupPositionLine, {
  immediate: true,
  debounce: DEBOUNCE_DEFAULT_PERIOD
})

watchDebounced(() => tpOrder.value, setupTpOrderline, {
  immediate: true,
  debounce: DEBOUNCE_DEFAULT_PERIOD
})

watchDebounced(() => slOrder.value, setupSlOrderline, {
  immediate: true,
  debounce: DEBOUNCE_DEFAULT_PERIOD
})

watchDebounced(
  () => props.historicalTrades,
  () => setupChartMarkers(),
  {
    immediate: true,
    debounce: DEBOUNCE_DEFAULT_PERIOD
  }
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
    })

    if (tradingViewChart) {
      tradingViewChart
        .onIntervalChanged()
        .subscribe(null, (selectedInterval: TradingChartInterval) => {
          if (
            selectedInterval === props.interval ||
            selectedInterval === TradingChartInterval['1m']
          ) {
            return
          }

          setupChartMarkers(selectedInterval)
          emit('interval:change', selectedInterval)
        })

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

        initChartInfo()
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

function initChartInfo() {
  setupTpOrderline()
  setupSlOrderline()
  setupChartMarkers()
  setupPositionLine()
  modifyLimitOrderLines()
}

async function setupPositionLine() {
  const tradingViewChart = tradingView.value?.view?.chart()

  if (!tradingViewChart || !props.currentPosition) {
    return
  }

  const uiPnl = pnl.value
    .abs()
    .toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS, BigNumberInBase.ROUND_DOWN)

  const pnlPrefix = new BigNumberInBase(uiPnl).isZero()
    ? ''
    : pnl.value?.isNegative()
      ? '-'
      : '+'

  const formattedPnl = `${pnlPrefix}${uiPnl}`

  const formattedEntryPrice = sharedToBalanceInTokenInBase({
    value: props.currentPosition.entryPrice,
    decimalPlaces: props.market.quoteToken.decimals
  }).toFixed(props.market.priceDecimals, BigNumberInBase.ROUND_DOWN)

  const positionDirection =
    props.currentPosition.direction === TradeDirection.Long
      ? t('trade.long')
      : t('trade.short')

  const themeColor =
    props.currentPosition?.direction === TradeDirection.Long
      ? '#0EE29B'
      : '#F3164D'

  if (!showTradeHistory.value) {
    if (positionLine.value) {
      positionLine.value?.remove()
      positionLine.value = undefined
    }

    return
  } else if (!positionLine.value) {
    positionLine.value = await tradingViewChart.createPositionLine()

    positionLine.value
      .setLineStyle(2)
      .setPrice(formattedEntryPrice)
      .setLineColor(themeColor)
      .setText(positionDirection)
      .setBodyTextColor(themeColor)
      .setBodyBorderColor(themeColor)
      .setBodyBackgroundColor('#14151A')
      .setQuantityBorderColor(themeColor)
      .setQuantityBackgroundColor('#14151A')
      .setQuantity(`${t('common.pnl').toUpperCase()} ${formattedPnl}`)

    return
  }

  positionLine.value
    .setText(positionDirection)
    .setPrice(formattedEntryPrice)
    .setQuantity(`${t('common.pnl').toUpperCase()} ${formattedPnl}`)
}

function setupChartMarkers(interval?: TradingChartInterval) {
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
      const updatedMarks = !showTradeHistory.value ? [] : customMarks
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
  nextTick(() => {
    const chart = tradingView.value.view?.chart()

    clearLimitOrderlines()

    if (
      !chart ||
      !showTradeHistory.value ||
      route.query?.interface === TradingInterface.TradingBots
    ) {
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
        .setCancelButtonIconColor('#FFF')
        .setBodyBackgroundColor('#14151A')
        .setQuantityBorderColor(themeColor)
        .setQuantityBackgroundColor('#14151A')
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
    })
  })
}

function setupTpOrderline() {
  setupTpSlBaseOrderline(true)
}

function setupSlOrderline() {
  setupTpSlBaseOrderline()
}

function setupTpSlBaseOrderline(isTakeProfit?: boolean) {
  nextTick(() => {
    const chart = tradingView.value.view?.chart()

    const selectedOrder = isTakeProfit ? tpOrder.value : slOrder.value
    const selectedOrderline = isTakeProfit
      ? tpOrderline.value
      : slOrderline.value

    if (selectedOrderline) {
      toRaw(selectedOrderline).remove()

      if (isTakeProfit) {
        tpOrderline.value = undefined
      } else {
        slOrderline.value = undefined
      }
    }

    if (!chart || !selectedOrder || !showTradeHistory.value) {
      return
    }

    const orderLine = chart.createOrderLine({ disableUndo: true })

    const formattedTriggerPrice = sharedToBalanceInTokenInBase({
      value: selectedOrder?.triggerPrice || '0',
      decimalPlaces: props.market.quoteToken.decimals
    }).toFixed(props.market.priceDecimals)

    const isLong = props.currentPosition?.direction === TradeDirection.Long

    const themeColor = isLong ? '#F3164D' : '#0EE29B'
    const triggerPricePrefix = isLong
      ? isTakeProfit
        ? '>'
        : '<'
      : isTakeProfit
        ? '<'
        : '>'

    orderLine
      .setLineStyle(2)
      .setPrice(formattedTriggerPrice)
      .setLineColor(themeColor)
      .setBodyTextColor(themeColor)
      .setBodyBorderColor(themeColor)
      .setCancelButtonIconColor('#FFF')
      .setBodyBackgroundColor('#14151A')
      .setQuantityBorderColor(themeColor)
      .setQuantityBackgroundColor('#14151A')
      .setCancelButtonBorderColor(themeColor)
      .setCancelButtonBackgroundColor('#14151A')
      .setText(`${isTakeProfit ? t('trade.tp') : t('trade.sl')}  `) // if orderline can't be moved = tradingview removes "|" + there will be excess space, so trailing space = to keep text aligned
      .setQuantity(`${triggerPricePrefix} ${formattedTriggerPrice}`)

    orderLine.onCancel?.(() => {
      toRaw(orderLine).remove()

      if (isTakeProfit) {
        tpOrderline.value = undefined
        emit('tp-sl:cancel', { isTp: true, order: tpOrder.value })

        return
      }

      slOrderline.value = undefined
      emit('tp-sl:cancel', { isTp: false, order: slOrder.value })
    })

    if (isTakeProfit) {
      tpOrderline.value = orderLine
      return
    }

    slOrderline.value = orderLine
  })
}

defineExpose({ setupTpOrderline, setupSlOrderline, modifyLimitOrderLines })
</script>

<template>
  <div class="relative w-full h-full">
    <AppCheckbox
      v-if="sharedWalletStore.isUserConnected"
      v-model="showTradeHistory"
      v-bind="{ isReverse: true }"
      class="absolute top-1 right-[155px] flex-row-reverse max-2xl:hidden"
      @update:model-value="initChartInfo"
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
