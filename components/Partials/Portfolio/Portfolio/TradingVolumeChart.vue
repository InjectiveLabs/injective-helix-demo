<script setup lang="ts">
import ApexCharts, { ApexOptions } from 'apexcharts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { colors } from '@/nuxt-config/tailwind'

const props = defineProps({
  volumeSeries: {
    type: Array as PropType<number[][]>,
    required: true
  }
})

const { t } = useLang()

let chart: ApexCharts

const options: ApexOptions = {
  series: [
    {
      name: t('trade.volume'),
      data: props.volumeSeries,
      color: colors.blue[500]
    }
  ],

  chart: {
    type: 'bar',
    height: 350,
    background: 'transparent',
    toolbar: {
      show: false
    }
  },

  theme: {
    mode: 'dark'
  },

  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '85%',
      borderRadius: 3
    }
  },

  dataLabels: {
    enabled: false
  },

  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
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
        return val.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
      }
    }
  },

  fill: {
    opacity: 1
  }
}

onMounted(() => {
  chart = new ApexCharts(
    document.querySelector('#dashboard-volume-chart'),
    options
  )
  chart.render()
})

onUnmounted(() => {
  chart.destroy()
})
</script>

<template>
  <div id="dashboard-volume-chart" />
</template>
