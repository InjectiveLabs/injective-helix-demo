<script setup lang="ts">
import ApexCharts, { ApexOptions } from 'apexcharts'
import { BigNumber } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { colors } from '@/nuxt-config/tailwind'

const props = defineProps({
  series: {
    type: Array as PropType<number[][]>,
    required: true
  }
})

const seriesMock = [
  [1617206400000, 12323],
  [1617292800000, 11323],
  [1617379200000, 13323],
  [1617465600000, 14323],
  [1617552000000, 15323],
  [1617638400000, 16323],
  [1617724800000, 17323],
  [1617811200000, 18323],
  [1617897600000, 19323],
  [1617984000000, 20323],
  [1618070400000, 21323],
  [1618156800000, 22323],
  [1618243200000, 23323],
  [1618329600000, 24323],
  [1618416000000, 25323],
  [1618502400000, 26323],
  [1618588800000, 27323],
  [1618675200000, 28323],
  [1618761600000, 29323],
  [1618848000000, 30323],
  [1618934400000, 31323],
  [1619020800000, 32323],
  [1619107200000, 33323],
  [1619193600000, 34323],
  [1619280000000, 35323],
  [1619366400000, 36323],
  [1619452800000, 37323],
  [1619539200000, 38323],
  [1619625600000, 39323],
  [1619712000000, 40323],
  [1619798400000, 41323],
  [1619884800000, 42323],
  [1619971200000, 43323],
  [1620057600000, 44323],
  [1620144000000, 45323],
  [1620230400000, 46323],
  [1620316800000, 47323],
  [1620403200000, 48323],
  [1620489600000, 49323],
  [1620576000000, 50323],
  [1620662400000, 51323],
  [1620748800000, 52323],
  [1620835200000, 53323]
]

const { t } = useLang()

const chartEl = ref<HTMLElement | null>(null)
let chart: ApexCharts

const options: ApexOptions = {
  series: [
    {
      name: t('trade.volume'),
      data: props.series.length ? props.series : seriesMock,
      color: colors.green[500]
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
    colors: ['#ffffff48'],
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
      opacityFrom: 0.9,
      opacityTo: 0.3,
      colorStops: [
        { color: colors.green[500], offset: 30, opacity: 0.5 },
        { color: '#ffffff', offset: 100, opacity: 0 }
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
