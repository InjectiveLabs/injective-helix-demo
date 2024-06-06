<script setup lang="ts">
import ApexCharts, { ApexOptions } from 'apexcharts'
import { BigNumber } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { colors } from '@/nuxt-config/tailwind'

const props = defineProps({
  isProfit: {
    type: Boolean,
    default: true
  },

  series: {
    type: Array as PropType<number[][]>,
    required: true
  }
})

const { t } = useLang()

const chartEl = ref<HTMLElement | null>(null)
let chart: ApexCharts

const options: ApexOptions = {
  series: [
    {
      name: t('trade.volume'),
      data: props.series,
      color: props.isProfit ? colors.green[500] : colors.red[500]
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
    colors: [props.isProfit ? colors.green[500] : colors.red[500]],
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
        return ` $ ${new BigNumber(val).toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }
    }
  },

  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,

      colorStops: [
        {
          color: props.isProfit ? colors.green[500] : colors.red[500],
          offset: 30,
          opacity: 0.5
        },
        {
          color: props.isProfit ? colors.green[500] : colors.red[500],
          offset: 90,
          opacity: 0
        }
      ]
    }
  }
}

onMounted(() => {
  chart = new ApexCharts(chartEl.value, options)
  chart.render()
})

onUnmounted(() => {
  chart.destroy()
})
</script>

<template>
  <div ref="chartEl" />
</template>
