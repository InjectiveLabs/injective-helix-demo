<script lang="ts" setup>
import { SpotLimitOrder, DerivativeLimitOrder } from '@injectivelabs/sdk-ts'
import config from '@/app/trading-view/config'
import { widget as TradingViewWidget } from '@/assets/js/chart/charting_library.esm'
import {
  BusEvents,
  UiSpotMarket,
  UiDerivativeMarket,
  TradingChartInterval
} from '@/types'

const props = withDefaults(
  defineProps<{
    symbol: string
    isSpot: boolean
    interval: string
    datafeedEndpoint: string
    market: UiSpotMarket | UiDerivativeMarket
    orders?: Array<SpotLimitOrder | DerivativeLimitOrder>
  }>(),
  { orders: () => [] }
)

const emit = defineEmits<{
  ready: []
  'interval:change': [value: TradingChartInterval]
  'order:close': [order: SpotLimitOrder | DerivativeLimitOrder]
  'limit-price:change': [
    { order: SpotLimitOrder | DerivativeLimitOrder; newPrice: number }
  ]
}>()

const containerId = `tv_chart_container-${window.crypto
  .getRandomValues(new Uint32Array(1))[0]
  .toString()}`

const orderLineRefs = ref<any[]>([])
const orderLines = ref<Record<string, any>>({})
const tradingView = ref<{ view: any }>({ view: undefined })

onMounted(() => {
  useEventBus(BusEvents.LimitOrdersModifyOnChart).on(modifyLimitOrderLines)
  useEventBus(BusEvents.LimitOrdersRemoveFromChart).on((order) =>
    cancelLimitOrders(order as SpotLimitOrder | DerivativeLimitOrder)
  )

  const widgetOptions = config({
    containerId,
    symbol: props.symbol,
    interval: props.interval,
    datafeedEndpoint: props.datafeedEndpoint
  })
  const tradingWidget = new TradingViewWidget(widgetOptions as any)
  tradingWidget.onChartReady(() => {
    tradingWidget.applyOverrides(widgetOptions.overrides)

    nextTick(() => {
      tradingView.value.view = tradingWidget

      emit('ready')

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
  })
})

function modifyLimitOrderLines() {
  nextTick(() => {
    const chart = tradingView.value.view?.chart()

    if (!chart) {
      return
    }

    if (props.orders.length === 0) {
      return
    }

    props.orders?.forEach((order) => {
      const orderlineRef = orderLineRefs.value.find(
        (ref) => ref?.orderHash === order.orderHash
      )

      if (!orderlineRef) {
        return
      }

      const orderLine = chart.createOrderLine({ disableUndo: true })

      orderLine.setLineStyle(2)
      orderLine.setLineColor('#F16969')
      orderLine.setBodyBackgroundColor('#FFF')
      orderLine.setQuantityBackgroundColor('#000')
      orderLine.setPrice(orderlineRef.priceToString)
      orderLine.setQuantity(orderlineRef.quantityToString)
      orderLine.setText(`Limit @ ${orderlineRef.priceToString}`)

      orderLine.onMove?.(() => {
        const newPrice = orderLine.getPrice()
        orderLine.setText(`Limit @ ${newPrice.toFixed(4)}`)
        emit('limit-price:change', { order, newPrice })
      })

      orderLine.setCancellable(true)
      orderLine.onCancel?.(() => {
        emit('order:close', order)
      })

      orderLines.value[order.orderHash] = orderLine
    })
  })
}

function onRemoveOrderLines(order: SpotLimitOrder | DerivativeLimitOrder) {
  const orderLine = orderLines.value[order.orderHash]

  if (!orderLine) {
    return
  }

  orderLine.remove()
  delete orderLines.value[order.orderHash]
}

function cancelLimitOrders(order: SpotLimitOrder | DerivativeLimitOrder) {
  if (!order) {
    Object.values(orderLines.value).forEach((orderLine) => {
      orderLine.remove()
    })

    orderLines.value = {}

    return
  }

  onRemoveOrderLines(order as SpotLimitOrder | DerivativeLimitOrder)
}
</script>

<template>
  <div class="w-full h-full">
    <div
      :id="containerId"
      ref="tradingView"
      class="tv_chart_container w-full h-full"
    />

    <PartialsTradingMarketChartOrderLine
      v-for="order in orders"
      :key="order.orderHash"
      v-bind="{
        order,
        isSpot,
        market
      }"
      ref="orderLineRefs"
    />
  </div>
</template>
