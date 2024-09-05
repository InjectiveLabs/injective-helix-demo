<script setup lang="ts">
import {
  createChart,
  DeepPartial,
  TimeChartOptions,
  IChartApi,
  ISeriesApi,
  CrosshairMode,
  PriceScaleOptions,
  WhitespaceData,
  LineData,
  SeriesOptionsCommon,
  LineStyleOptions,
  TimeScaleOptions,
  Time
} from 'lightweight-charts'
import { mergeObjects } from '@/app/utils/helpers'

const defaultChartOptions = {
  crosshair: {
    mode: CrosshairMode.Normal
  },
  layout: {
    background: {
      color: 'transparent'
    }
  },
  grid: {
    horzLines: {
      color: '#222'
    },
    vertLines: {
      color: '#222'
    }
  }
}

const props = withDefaults(
  defineProps<{
    type?: string
    shouldFitContentOnResize?: boolean
    data: (LineData<number> | WhitespaceData<number>)[]
    autosize?: boolean
    chartOptions?: DeepPartial<TimeChartOptions>
    seriesOptions:
      | DeepPartial<LineStyleOptions & SeriesOptionsCommon>
      | undefined
    timeScaleOptions?: DeepPartial<TimeScaleOptions>
    priceScaleOptions?: DeepPartial<PriceScaleOptions>
    height?: number
    width?: number
  }>(),
  {
    type: 'line',
    autosize: true,
    shouldFitContentOnResize: false,
    chartOptions: () => ({}) as DeepPartial<TimeChartOptions>,
    timeScaleOptions: () => ({
      borderColor: 'transparent'
    }),
    priceScaleOptions: () => ({
      borderColor: 'transparent'
    }),
    height: undefined,
    width: undefined
  }
)

// Function to get the correct series constructor name for current series type.

// Lightweight Charts™ instances are stored as normal JS variables
// If you need to use a ref then it is recommended that you use `shallowRef` instead
let series: ISeriesApi<'Line'> | null
let chart: IChartApi | null

const chartContainer = ref()

const fitContent = () => {
  if (!chart) return
  chart.timeScale().fitContent()
}

const getChart = () => {
  return chart
}

defineExpose({ fitContent, getChart })

// Auto resizes the chart when the browser window is resized.
const resizeHandler = () => {
  if (!chart || !chartContainer.value) return
  const dimensions = chartContainer.value.getBoundingClientRect()
  chart.resize(dimensions.width, dimensions.height)

  if (props.shouldFitContentOnResize) {
    chart.timeScale().fitContent()
  }
}

// Creates the chart series and sets the data.
const addSeriesAndData = (_props: typeof props) => {
  if (!chart) {
    return
  }

  series = chart.addLineSeries(_props.seriesOptions)
  series.setData(_props.data as LineData<Time>[])
}

onMounted(() => {
  // Create the Lightweight Charts Instance using the container ref.
  chart = createChart(chartContainer.value, {
    ...mergeObjects(props.chartOptions, defaultChartOptions),
    height: props.height,
    width: props.width
  })

  addSeriesAndData(props)

  if (props.priceScaleOptions) {
    chart.priceScale('right').applyOptions(props.priceScaleOptions)
  }

  if (props.timeScaleOptions) {
    chart.timeScale().applyOptions(props.timeScaleOptions)
  }

  chart.timeScale().fitContent()

  if (props.autosize) {
    window.addEventListener('resize', resizeHandler)
  }
})

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null
  }
  if (series) {
    series = null
  }
  window.removeEventListener('resize', resizeHandler)
})

/*
 * Watch for changes to any of the component properties.

 * If an options property is changed then we will apply those options
 * on top of any existing options previously set (since we are using the
 * `applyOptions` method).
 *
 * If there is a change to the chart type, then the existing series is removed
 * and the new series is created, and assigned the data.
 *
 */
watch(
  () => props.autosize,
  (enabled) => {
    if (!enabled) {
      window.removeEventListener('resize', resizeHandler)
      return
    }
    window.addEventListener('resize', resizeHandler)
  }
)

watch(
  () => props.type,
  () => {
    if (series && chart) {
      chart.removeSeries(series)
    }
    addSeriesAndData(props)
  }
)

watch(
  () => props.data,
  (newData: any) => {
    if (!series) {
      return
    }

    series.setData(newData)
  }
)

watch(
  () => props.chartOptions,
  (newOptions) => {
    if (!chart) {
      return
    }

    chart.applyOptions({
      ...mergeObjects(newOptions, defaultChartOptions),
      height: props.height,
      width: props.width
    })
  }
)

watch(
  () => props.seriesOptions,
  (newOptions) => {
    if (!series || !newOptions) {
      return
    }

    series.applyOptions(newOptions)
  }
)

watch(
  () => props.priceScaleOptions,
  (newOptions) => {
    if (!chart) {
      return
    }

    chart.priceScale('right').applyOptions(newOptions)
  }
)

watch(
  () => props.timeScaleOptions,
  (newOptions) => {
    if (!chart) {
      return
    }

    chart.timeScale().applyOptions(newOptions)
  }
)
</script>

<template>
  <div ref="chartContainer" class="lw-chart"></div>
</template>

<style scoped>
.lw-chart {
  height: 100%;
}
</style>
