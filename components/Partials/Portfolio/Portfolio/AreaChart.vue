<script setup lang="ts">
import ApexCharts from 'apexcharts'
import { colors } from '@/nuxt-config/tailwind'
import { BigNumber } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import type { ApexOptions } from 'apexcharts'

const props = withDefaults(
  defineProps<{
    label?: string
    isProfit?: boolean
    series: number[][]
  }>(),
  { label: 'trade.amount' }
)

const { t } = useLang()

const chartEl = ref<null | HTMLElement>(null)
let chart: ApexCharts

const options: ApexOptions = {
  series: [
    {
      name: t(props.label),
      data: props.series,
      color: props.isProfit ? colors.green[500] : '#FFFFFF'
    }
  ],

  chart: {
    type: 'area',
    height: 350,
    background: 'transparent',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    }
  },

  theme: {
    mode: 'dark'
  },

  plotOptions: {
    area: {
      fillTo: 'origin'
    }
  },

  dataLabels: {
    enabled: false
  },

  stroke: {
    show: true,
    width: 2,
    colors: [props.isProfit ? colors.green[500] : '#FFFFFF'],
    curve: 'monotoneCubic'
  },

  grid: {
    borderColor: colors.brand[875]
  },

  xaxis: {
    type: 'datetime'
  },

  yaxis: {
    opposite: true,
    labels: {
      formatter(val) {
        return `$${new BigNumber(val).toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }
    }
  },

  fill: {
    type: 'solid',
    colors: [props.isProfit ? colors.green[500] : '#FFFFFF'],
    opacity: 0
  }
}

onMounted(() => {
  chart = new ApexCharts(chartEl.value, options)
  chart.render()
})

onUnmounted(() => {
  chart.destroy()
})

watch(
  () => props.series,
  (newSeries) => {
    chart?.updateSeries([
      {
        name: t(props.label),
        data: newSeries,
        color: props.isProfit ? colors.green[500] : '#FFFFFF'
      }
    ])
  }
)
</script>

<template>
  <div ref="chartEl" />
</template>
