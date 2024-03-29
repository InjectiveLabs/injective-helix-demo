<script setup lang="ts">
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
  WhitespaceData
} from 'lightweight-charts'
import {
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'

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
  }
}

const container = ref()
const wrapper = ref()

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

    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    })
  }

  candlestickSeries.setData(props.candlesticksData)

  candlestickSeries.priceFormatter().format = (price) => {
    return price > 1
      ? price.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
      : price.toFixed(UI_DEFAULT_MAX_DISPLAY_DECIMALS)
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
