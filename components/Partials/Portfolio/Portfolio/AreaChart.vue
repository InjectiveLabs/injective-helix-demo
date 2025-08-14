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

const options = computed<ApexOptions>(() => ({
  grid: { show: false },
  theme: { mode: 'dark' },
  dataLabels: { enabled: false },
  series: [
    {
      data: props.series,
      name: t(props.label),
      color: colors.blue[300]
    }
  ],
  chart: {
    type: 'line',
    height: 350,
    zoom: { enabled: false },
    toolbar: { show: false },
    background: 'transparent'
  },
  plotOptions: {
    area: { fillTo: 'origin' }
  },
  stroke: {
    width: 2,
    curve: 'smooth',
    colors: [colors.blue[300]]
  },
  xaxis: {
    type: 'datetime',
    axisTicks: { show: false },
    axisBorder: { show: false }
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
  }
}))

onMounted(() => {
  chart = new ApexCharts(chartEl.value, options.value)
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
        data: newSeries,
        name: t(props.label),
        color: colors.blue[300]
      }
    ])
  }
)
</script>

<template>
  <div ref="chartEl" />
</template>
