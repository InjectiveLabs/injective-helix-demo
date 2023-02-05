<script lang="ts" setup>
import config from '@/app/trading-view/config'
import { widget as TradingViewWidget } from '@/assets/js/chart/charting_library.esm'

const props = defineProps({
  symbol: {
    required: true,
    type: String
  },

  interval: {
    required: true,
    type: String
  },

  datafeedEndpoint: {
    required: true,
    type: String
  }
})

const emit = defineEmits<{ (e: 'ready'): void }>()

const containerId = `tv_chart_container-${window.crypto
  .getRandomValues(new Uint32Array(1))[0]
  .toString()}`

const tradingView = ref(null as any)

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

    nextTick(() => {
      tradingView.view = tradingWidget
      emit('ready')
    })
  })
})
</script>

<template>
  <div
    :id="containerId"
    ref="tradingView"
    class="tv_chart_container w-full h-full"
  ></div>
</template>
