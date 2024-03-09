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
  AreaStyleOptions,
  TimeScaleOptions,
  Time,
  AreaData
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
      visible: false
    },
    vertLines: {
      visible: false
    }
  }
}

const props = defineProps({
  shouldFitContentOnResize: Boolean,

  type: {
    type: String,
    default: 'area'
  },

  data: {
    type: Array as PropType<(LineData<number> | WhitespaceData<number>)[]>,
    required: true
  },

  autosize: {
    default: true,
    type: Boolean
  },

  chartOptions: {
    type: Object as PropType<DeepPartial<TimeChartOptions>>,
    default: () => ({}) as DeepPartial<TimeChartOptions>
  },

  seriesOptions: {
    type: Object as PropType<
      DeepPartial<AreaStyleOptions & SeriesOptionsCommon>
    >,
    required: true
  },

  timeScaleOptions: {
    type: Object as PropType<DeepPartial<TimeScaleOptions>>,
    default: () => ({
      borderColor: 'transparent'
    })
  },

  priceScaleOptions: {
    type: Object as PropType<DeepPartial<PriceScaleOptions>>,
    default: () => ({
      borderColor: 'transparent'
    })
  },

  height: {
    type: Number,
    default: undefined
  },

  width: {
    type: Number,
    default: undefined
  }
})

// Function to get the correct series constructor name for current series type.

// Lightweight Charts™ instances are stored as normal JS variables
// If you need to use a ref then it is recommended that you use `shallowRef` instead
let series: ISeriesApi<'Area'> | null
let chart: IChartApi | null

const chartContainer = ref()

const toolTipWidth = 120
const toolTipHeight = 80
const toolTipMargin = 15

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

  series = chart.addAreaSeries(_props.seriesOptions)
  series.setData(_props.data as AreaData<Time>[])
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

  if (series) {
    series.priceFormatter().format = (price) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price)
    }
  }

  chart.timeScale().fitContent()

  if (props.autosize) {
    window.addEventListener('resize', resizeHandler)
  }

  // Create and style the tooltip html element
  const toolTip = document.createElement('div')
  // `width: 96px; height: 80px; position: absolute; display: none; padding: 8px; box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000; top: 12px; left: 12px; pointer-events: none; border: 1px solid; border-radius: 2px;font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`
  toolTip.style.width = toolTipWidth + 'px'
  toolTip.style.height = toolTipHeight + 'px'
  toolTip.style.position = 'absolute'
  toolTip.style.display = 'none'
  toolTip.style.padding = '8px'
  toolTip.style.boxSizing = 'border-box'
  toolTip.style.fontSize = '12px'
  toolTip.style.textAlign = 'left'
  toolTip.style.zIndex = '1000'
  toolTip.style.top = '12px'
  toolTip.style.left = '12px'
  toolTip.style.pointerEvents = 'none'
  toolTip.style.border = '1px solid'
  toolTip.style.borderRadius = '2px'
  // toolTip.style.boxShadow = '0 0 10px 2px rgba(0, 255, 0, 0.4)'

  toolTip.style.background = 'rgba(20, 21, 26, 0.7)'
  toolTip.style.backdropFilter = 'blur(4px)'
  toolTip.style.color = 'white'
  toolTip.style.borderColor = 'rgba( 38, 166, 154, 1)'
  chartContainer.value.appendChild(toolTip)

  // update tooltip
  chart.subscribeCrosshairMove((param) => {
    if (
      param.point === undefined ||
      !param.time ||
      param.point.x < 0 ||
      param.point.x > chartContainer.value.clientWidth ||
      param.point.y < 0 ||
      param.point.y > chartContainer.value.clientHeight
    ) {
      toolTip.style.display = 'none'
    } else {
      if (!series) {
        return
      }
      // time will be in the same format that we supplied to setData.
      // thus it will be YYYY-MM-DD
      // const dateStr = param.time
      toolTip.style.display = 'block'
      const data = param.seriesData.get(series) as any

      const price = data.value !== undefined ? data.value : data.close

      const priceFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price)

      toolTip.innerHTML = `<div style="color: ${'rgba( 38, 166, 154, 1)'}">
        Portfolio
        </div>

        <div style="font-size: 18px; margin: 4px 0px; color: ${'white'}">
            
            ${priceFormatted}
            </div>
            <div style="color: ${'white'}">
            </div>`

      const y = param.point.y
      let left = param.point.x + toolTipMargin
      if (left > chartContainer.value.clientWidth - toolTipWidth) {
        left = param.point.x - toolTipMargin - toolTipWidth
      }

      let top = y + toolTipMargin
      if (top > chartContainer.value.clientHeight - toolTipHeight) {
        top = y - toolTipHeight - toolTipMargin
      }
      toolTip.style.left = left + 'px'
      toolTip.style.top = top + 'px'
    }
  })
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
    if (!series) {
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
  <div ref="chartContainer" class="lw-chart relative"></div>
</template>

<style scoped>
.lw-chart {
  height: 100%;
}
</style>
