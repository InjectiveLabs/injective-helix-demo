<script lang="ts" setup>
import config from '@/app/trading-view/config'
import { widget as TradingViewWidget } from '@/assets/js/chart/charting_library.esm'

const props = withDefaults(
  defineProps<{
    symbol: string
    interval: string
    datafeedEndpoint: string
  }>(),
  {
    // No default values needed for required props
  }
)

const emit = defineEmits<{ ready: [] }>()

const containerId = `tv_chart_container-${window.crypto
  .getRandomValues(new Uint32Array(1))[0]
  .toString()}`

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

    nextTick(() => {
      tradingView.value.view = tradingWidget
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
