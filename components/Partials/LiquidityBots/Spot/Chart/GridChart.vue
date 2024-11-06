<script setup lang="ts">
import ApexChart, { ApexOptions } from 'apexcharts'
import { UiMarketWithToken } from '~/types'

// type OrderAnnotation = {
//   y: number
//   borderColor: string
//   label: {
//     borderColor: string
//     style: {
//       color: string
//       background: string
//     }
//     text: string
//     position?: string
//     offsetX?: number
//     textAnchor?: string
//   }
// }

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const exchangeStore = useExchangeStore()

const apexChart = ref(undefined as ApexChart | undefined)

const priceSeries = computed(() => {
  const market = exchangeStore.marketsHistory.find(
    (m) => m.marketId === props.market.marketId
  )

  if (!market) return []

  return market.time.map((time, i) => [time * 1000, market.highPrice[i]])
})

const options = computed<ApexOptions>(() => ({
  chart: {
    height: 500,
    width: '100%',
    type: 'area',
    background: 'transparent',
    toolbar: {
      show: false
    }
  },
  theme: { mode: 'dark' },

  dataLabels: { enabled: false },

  xaxis: {
    type: 'datetime',
    labels: { datetimeUTC: false }
  },

  stroke: { width: 1, curve: 'straight' },

  series: [{ data: priceSeries.value, name: 'Price' }],

  annotations: {
    yaxis: [
      {
        y: 17,
        y2: 18,

        fillColor: '#3B7CFF',
        borderColor: '#3B7CFF',

        label: {
          borderColor: '#3B7CFF',

          text: 'Upper Lower',

          style: {
            background: '#3B7CFF',
            color: '#fff'
          }
        }
      }
    ]
  },

  grid: {
    borderColor: '#333'
  },

  colors: ['#3B7CFF'],

  fill: {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.45,
      opacityTo: 0.05,
      colorStops: [
        { offset: 0, color: '#3B7CFF', opacity: 0.7 },
        { offset: 100, color: '#3B7CFF', opacity: 0.1 }
      ]
    }
  }
}))

onMounted(() => {
  apexChart.value = new ApexChart(
    document.getElementById('lp-grid-chart'),
    options.value
  )

  apexChart.value.render()
})

onUnmounted(() => {
  apexChart.value?.destroy()
})

watch(
  () => [props.market, exchangeStore.marketsHistory],
  () => {
    apexChart.value?.updateOptions({
      series: [{ data: priceSeries.value, name: 'Price' }]
    })
  }
)
</script>

<template>
  <div id="lp-grid-chart"></div>
</template>
