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

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const props = withDefaults(
  defineProps<{
    symbol: string
    isSpot: boolean
    interval: string
    datafeedEndpoint: string
    market: UiSpotMarket | UiDerivativeMarket
    orders?: {
      formattedPrice: string
      formattedQuantity: string
      order: SpotLimitOrder | DerivativeLimitOrder
    }[]
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

const orderLines = ref<Record<string, any>>({})
const tradingView = ref<{ view: any }>({ view: undefined })

onWalletDisconnected(clearAllOrderLines)

onMounted(() => {
  useEventBus(BusEvents.LimitOrdersModifyOnChart).on(modifyLimitOrderLines)

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

    clearAllOrderLines()

    if (props.orders.length === 0) {
      return
    }

    props.orders?.forEach(({ order, formattedPrice, formattedQuantity }) => {
      const orderLine = chart.createOrderLine({ disableUndo: true })

      orderLine.setLineStyle(2)
      orderLine.setLineColor('#F16969')
      orderLine.setBodyBackgroundColor('#FFF')
      orderLine.setQuantityBackgroundColor('#000')
      orderLine.setPrice(formattedPrice)
      orderLine.setQuantity(formattedQuantity)
      orderLine.setText(`Limit @ ${formattedPrice}`)

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

function removeOrderline(order: SpotLimitOrder | DerivativeLimitOrder) {
  const orderLine = orderLines.value[order.orderHash]

  if (!orderLine) {
    return
  }

  orderLine.remove()
  delete orderLines.value[order.orderHash]
}

function clearAllOrderLines() {
  Object.values(orderLines.value).forEach((orderLine) => {
    orderLine.remove()
  })

  orderLines.value = {}
}

watch(
  [() => spotStore.subaccountOrders, () => derivativeStore.subaccountOrders],
  (
    [newSpotOrders, newDerivativeOrders],
    [oldSpotOrders, oldDerivativeOrders]
  ) => {
    const newOrders = props.isSpot ? newSpotOrders : newDerivativeOrders
    const oldOrders = props.isSpot ? oldSpotOrders : oldDerivativeOrders

    if (newOrders.length === oldOrders.length) {
      modifyLimitOrderLines()

      return
    }

    const newOrderHashes = new Set(newOrders.map((o) => o.orderHash))
    const [removedOrder] = oldOrders.filter(
      ({ orderHash }) => !newOrderHashes.has(orderHash)
    )

    if (!removedOrder) {
      return
    }

    removeOrderline(removedOrder)
  },
  { deep: true }
)
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
