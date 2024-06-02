<script setup lang="ts">
import ApexCharts, { ApexOptions } from 'apexcharts'
import { IsSpotKey, SpotMarketKey, DerivativeMarketKey } from '@/types'

const percentage = 0.01

const isSpot = inject(IsSpotKey)
const spotMarket = inject(SpotMarketKey, undefined)
const derivativeMarket = inject(DerivativeMarketKey, undefined)

const orderbookStore = useOrderbookStore()

const { lastTradedPrice: lastTradedSpotPrice } = useSpotLastPrice(
  computed(() => spotMarket!.value!)
)

const { lastTradedPrice: lastTradedDerivativePrice } = useDerivativeLastPrice(
  computed(() => derivativeMarket!.value!)
)

const lastTradedPrice = computed(() =>
  isSpot ? lastTradedSpotPrice.value : lastTradedDerivativePrice.value
)

let chart: ApexCharts

const buysSerie = computed(() =>
  orderbookStore.buys
    .slice(0, 1000)
    .reverse()
    .filter(
      (item) =>
        Number(item.price) > lastTradedPrice.value.toNumber() * (1 - percentage)
    )
    .map((item) => ({
      x: +item.price,
      y: +item.totalVolume
    }))
)

const sellsSerie = computed(() =>
  orderbookStore.sells
    .slice(0, 1000)
    .filter(
      (item) =>
        Number(item.price) < lastTradedPrice.value.toNumber() * (1 + percentage)
    )
    .map((item) => ({
      x: +item.price,
      y: +item.totalVolume
    }))
)

const options: ApexOptions = {
  series: [
    {
      name: 'Buys',
      data: buysSerie.value,
      color: '#3f3'
    },
    {
      name: 'Sells',
      data: sellsSerie.value,
      color: '#f33'
    }
  ],

  theme: {
    mode: 'dark'
  },

  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 2,
      inverseColors: false,
      opacityFrom: 0.4,
      opacityTo: 0.0,
      stops: [20, 100, 100, 100]
    },
    colors: ['#2e2', '#f33']
  },

  chart: {
    animations: {
      enabled: false,
      animateGradually: {
        enabled: true
      },
      speed: 200
    },

    background: 'transparent',

    type: 'area',
    height: 550,

    zoom: {
      enabled: false
    },

    toolbar: {
      show: false
    }
  },

  dataLabels: {
    enabled: false
  },

  stroke: {
    curve: 'smooth',
    width: 1
  },

  xaxis: {
    type: 'numeric',
    max: lastTradedPrice.value.toNumber() * (1 + percentage),
    min: lastTradedPrice.value.toNumber() * (1 - percentage)
  },

  yaxis: {
    opposite: true
  },

  grid: {
    yaxis: {
      lines: {
        show: true
      }
    },
    borderColor: '#222'
  },

  tooltip: {
    x: {
      show: false
    }
  }
}

onMounted(() => {
  chart = new ApexCharts(document.querySelector('#chart'), options)
  chart.render()
})

watch([buysSerie, sellsSerie], () => {
  chart?.updateSeries([
    {
      name: 'Buys',
      data: buysSerie.value
    },
    {
      name: 'Sells',
      data: sellsSerie.value
    }
  ])
})

onUnmounted(() => {
  chart?.destroy()
})
</script>

<template>
  <div id="chart"></div>
</template>
