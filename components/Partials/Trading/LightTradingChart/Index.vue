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
import { colors } from '@/nuxt-config/tailwind'

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
    background: {
      type: ColorType.Solid,
      color: colors.brand[900]
    },
    textColor: 'white'
  },
  grid: {
    horzLines: { style: LineStyle.Solid, color: colors.brand[800] },
    vertLines: { style: LineStyle.Dashed, color: colors.brand[800] }
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    horzLine: {
      labelBackgroundColor: '#333'
    }
  },
  autoSize: true,
  timeScale: {
    timeVisible: true
  }
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
    return new BigNumberInBase(price).toFixed(decimalPlaces.value)
  }

  window.addEventListener('resize', resizeHandler)
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
  <div ref="wrapper" class="flex-1 relative">
    <div ref="container" class="lw-chart absolute inset-0"></div>
  </div>
</template>

<style scoped>
.lw-chart {
  height: 100%;
}
</style>
