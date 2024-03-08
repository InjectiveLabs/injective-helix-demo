<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  Time,
  IChartApi,
  LineStyle,
  ColorType,
  DeepPartial,
  createChart,
  ChartOptions,
  HistogramData,
  CandlestickData,
  WhitespaceData,
  CrosshairMode
} from 'lightweight-charts'

defineExpose({ fitContent, getChart, updateCandlesticksData })

const props = defineProps({
  candlesticksData: {
    type: Object as PropType<(CandlestickData<Time> | WhitespaceData<Time>)[]>,
    required: true
  },

  volumeData: {
    type: Object as PropType<(HistogramData<Time> | WhitespaceData<Time>)[]>,
    required: false,
    default: undefined
  },

  tickSize: {
    type: Number,
    required: true
  }
})

let chart: IChartApi
let candlestickSeries: ReturnType<typeof chart.addCandlestickSeries>
let volumeSeries: ReturnType<typeof chart.addHistogramSeries>

const chartOptions: DeepPartial<ChartOptions> = {
  layout: {
    background: { type: ColorType.Solid, color: '#14161F' },
    textColor: 'white'
  },
  grid: {
    horzLines: { style: LineStyle.Solid, color: '#ffffff10' },
    vertLines: { style: LineStyle.Dashed, color: '#ffffff10' }
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    horzLine: {
      labelBackgroundColor: '#333'
    }
  },
  timeScale: {
    visible: true,
    timeVisible: true
  },
  autoSize: true
}

const container = ref()
const wrapper = ref()

const decimalPlaces = computed(() => {
  return new BigNumberInBase(props.tickSize).dp() || 0
})

function fitContent() {
  if (!chart) {
    return
  }

  chart.timeScale().fitContent()
}

function getChart() {
  return chart
}

function updateCandlesticksData(data: CandlestickData<Time>) {
  if (!candlestickSeries) {
    return
  }

  candlestickSeries.update(data)
}

function resizeHandler() {
  if (!chart || !wrapper.value) {
    return
  }

  const dimensions = wrapper.value.getBoundingClientRect()

  chart.resize(dimensions.width, dimensions.height)
}

function init() {
  chart = createChart(container.value!, chartOptions)

  candlestickSeries = chart.addCandlestickSeries()

  volumeSeries = chart.addHistogramSeries({
    color: '#26a69a',
    priceFormat: {
      type: 'volume'
    },
    priceScaleId: ''
  })

  if (props.volumeData) {
    volumeSeries.setData(props.volumeData)

    candlestickSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.05,
        bottom: 0.2
      }
    })

    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.9,
        bottom: 0
      }
    })
  }

  candlestickSeries.setData(props.candlesticksData)

  candlestickSeries.applyOptions({
    priceFormat: {
      minMove: props.tickSize
    }
  })

  candlestickSeries.priceFormatter().format = (price) => {
    return price.toFixed(decimalPlaces.value)
  }
}

function destroy() {
  if (chart) {
    chart.remove()
    chart = null!
  }

  if (candlestickSeries) {
    candlestickSeries = null!
  }

  window.removeEventListener('resize', resizeHandler)
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  destroy()
})

watch(
  () => props.candlesticksData,
  () => {
    if (candlestickSeries) {
      candlestickSeries.setData(props.candlesticksData)
    }
  }
)
</script>

<template>
  <div>
    <div ref="wrapper" class="h-[450px] md:h-[663px] rounded-sm">
      <div
        ref="container"
        class="lw-chart border rounded-md z-20 bg-gray-1000"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.lw-chart {
  height: 100%;
}
</style>
