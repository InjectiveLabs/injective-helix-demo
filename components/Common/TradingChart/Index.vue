<script setup lang="ts">
import {
  ChartOptions,
  ColorType,
  DeepPartial,
  IChartApi,
  LineStyle,
  createChart,
  CandlestickData,
  Time,
  WhitespaceData
} from 'lightweight-charts'

const props = defineProps({
  candlesticksData: {
    type: Object as PropType<(CandlestickData<Time> | WhitespaceData<Time>)[]>,
    required: true
  }
})

const container = ref()
const wrapper = ref()

let chart: IChartApi

let candlestickSeries: ReturnType<typeof chart.addCandlestickSeries>

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

const fitContent = () => {
  if (!chart) return
  chart.timeScale().fitContent()
}

const getChart = () => {
  return chart
}

const updateCandlesticksData = (data: CandlestickData<Time>) => {
  if (!candlestickSeries) return

  candlestickSeries.update(data)
}

defineExpose({ fitContent, getChart, updateCandlesticksData })

const resizeHandler = () => {
  if (!chart || !wrapper.value) return
  const dimensions = wrapper.value.getBoundingClientRect()
  chart.resize(dimensions.width, dimensions.height)
}

onMounted(() => {
  chart = createChart(container.value!, chartOptions)

  candlestickSeries = chart.addCandlestickSeries()

  candlestickSeries.setData(props.candlesticksData)

  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null!
  }
  if (candlestickSeries) {
    candlestickSeries = null!
  }

  window.removeEventListener('resize', resizeHandler)
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
    <div ref="wrapper" class="h-[450px] md:h-[663px]">
      <div ref="container" class="lw-chart border rounded-md z-20"></div>
    </div>
  </div>
</template>

<style scoped>
.lw-chart {
  height: 100%;
}
</style>
