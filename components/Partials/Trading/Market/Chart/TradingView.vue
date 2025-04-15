<script lang="ts" setup>
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import config from '@/app/trading-view/config'
import { DEFAULT_100_CHART_CANDLE_BAR_SPACING } from '@/app/utils/constants'
import { widget as TradingViewWidget } from '@/assets/js/chart/charting_library.esm'
import { TradingChartInterval } from '@/types'
import type { UiSpotMarket, UiDerivativeMarket } from '@/types'
import type {
  SpotLimitOrder,
  DerivativeLimitOrder
} from '@injectivelabs/sdk-ts'

const appStore = useAppStore()
const { t } = useLang()

const props = withDefaults(
  defineProps<{
    symbol: string
    isSpot: boolean
    interval: string
    datafeedEndpoint: string
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

const orderLines = ref<Record<string, any>>({})
const tradingView = ref<{ view: any }>({ view: undefined })

onMounted(() => {
  const widgetOptions = config({
    containerId,
    symbol: props.symbol,
    interval: props.interval,
    datafeedEndpoint: props.datafeedEndpoint
  })

  const tradingWidget = new TradingViewWidget(widgetOptions as any)

  tradingWidget.onChartReady(() => {
    tradingWidget.applyOverrides(widgetOptions.overrides)
    const tradingViewChart = tradingWidget?.chart()

    nextTick(() => {
      tradingView.value.view = tradingWidget
      modifyLimitOrderLines()
    })

    tradingWidget.subscribe('series_properties_changed', () => {
      nextTick(() => {
        const iframes = document.querySelectorAll('iframe')

        const iframe = Array.from(iframes).find((iframe) =>
          iframe.id.startsWith('tradingview_')
        )

        if (!iframe || !iframe.contentDocument) {
          return
        }

        const xpath =
          "//div[contains(@class, 'isActive-9pA37sIi')]//div[contains(@class, 'value-e0RYyFXU')]"

        const result = iframe.contentDocument.evaluate(
          xpath,
          iframe.contentDocument,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        )

        const element = result.singleNodeValue

        if (!element) {
          return
        }

        const interval =
          TradingChartInterval[
            element.textContent as keyof typeof TradingChartInterval
          ]

        if (!interval) {
          return
        }

        emit('interval:change', interval)
      })
    })

    if (tradingViewChart) {
      setTimeout(() => {
        tradingViewChart.setBarSpacing(
          appStore.userState.preferences.chartCandleBarSpacing ||
            DEFAULT_100_CHART_CANDLE_BAR_SPACING
        )

        tradingViewChart.onVisibleRangeChanged().subscribe(null, () => {
          appStore.setChartCandleBarSpacing(
            tradingViewChart.getTimeScale()?.barSpacing() ||
              DEFAULT_100_CHART_CANDLE_BAR_SPACING
          )
        })

        emit('ready')
      }, 100)
    }
  })
})

function clearAllOrderLines() {
  Object.values(orderLines.value).forEach((orderLine) => {
    nextTick(() => {
      toRaw(orderLine).remove()
    })
  })

  orderLines.value = {}
}

function modifyLimitOrderLines() {
  nextTick(() => {
    const updatedOrderLinesId: string[] = []
    const chart = tradingView.value.view?.chart()

    if (!chart) {
      return
    }

    clearAllOrderLines()

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
      const existingOrderLine = orderLines.value[uid]
      const orderLine =
        existingOrderLine || chart.createOrderLine({ disableUndo: true })

      if (existingOrderLine) {
        orderLine.setQuantity(
          `${formattedUnfilledQuantity} ${props.market?.baseToken?.symbol}`
        )

        return
      }

      const themeColor = [OrderSide.Buy, OrderSide.BuyPO].includes(
        order.orderSide
      )
        ? '#0EE29B'
        : '#F3164D'

      orderLine.setLineStyle(2)
      orderLine.setPrice(formattedPrice)
      orderLine.setBodyTextColor(themeColor)
      orderLine.setLineColor(themeColor)
      orderLine.setBodyBackgroundColor('#14151A')
      orderLine.setBodyBorderColor(themeColor)
      orderLine.setQuantityBackgroundColor('#14151A')
      orderLine.setQuantityBorderColor(themeColor)
      orderLine.setCancelButtonBackgroundColor('#14151A')
      orderLine.setCancelButtonIconColor(themeColor)
      orderLine.setCancelButtonBorderColor(themeColor)
      orderLine.setQuantity(
        `${formattedUnfilledQuantity} ${props.market?.baseToken?.symbol}`
      )
      orderLine.setText(
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

        delete orderLines.value[uid]

        emit('order:change', {
          order,
          newPrice
        })

        // temp orderline
        orderLines.value[`${newPrice}-${order.quantity}`] = orderLine
        orderLine.setCancellable(false)
        orderLine.setCancelButtonIconColor('#000')
      })

      orderLine.onCancel?.(() => {
        emit('order:close', {
          order
        })

        toRaw(orderLine).remove()
        delete orderLines.value[uid]
      })

      orderLines.value[uid] = orderLine
      updatedOrderLinesId.push(uid)
    })

    // // remove outdated lines
    Object.keys(orderLines.value).forEach((uid) => {
      if (!updatedOrderLinesId.includes(uid)) {
        nextTick(() => {
          toRaw(orderLines.value[uid]).remove()
          delete orderLines.value[uid]
        })
      }
    })
  })
}

watch(() => props.orders, modifyLimitOrderLines, { deep: true })

defineExpose({ modifyLimitOrderLines })
</script>

<template>
  <div class="w-full h-full">
    <div
      :id="containerId"
      ref="tradingView"
      class="tv_chart_container w-full h-full"
    />
  </div>
</template>
