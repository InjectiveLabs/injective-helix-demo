<script setup lang="ts">
import ApexCharts, { ApexOptions } from 'apexcharts'
import { IsSpotKey, SpotMarketKey, DerivativeMarketKey } from '@/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

const PERCENTAGE = 0.1

const isSpot = inject(IsSpotKey)
const spotMarket = inject(SpotMarketKey, undefined)
const derivativeMarket = inject(DerivativeMarketKey, undefined)

const orderbookStore = useOrderbookStore()
const isMobile = useIsMobile()

const { lastTradedPrice: lastTradedSpotPrice } = useSpotLastPrice(
  computed(() => spotMarket!.value!)
)

const { lastTradedPrice: lastTradedDerivativePrice } = useDerivativeLastPrice(
  computed(() => derivativeMarket!.value!)
)

const lastTradedPrice = computed(() =>
  isSpot ? lastTradedSpotPrice.value : lastTradedDerivativePrice.value
)

const priceDecimals = computed(() =>
  isSpot
    ? spotMarket?.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
    : derivativeMarket?.value?.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
)

const quantityDecimals = computed(() =>
  isSpot
    ? spotMarket?.value?.quantityDecimals || 2
    : derivativeMarket?.value?.quantityDecimals || 2
)

let chart: ApexCharts

const buysSerie = computed(() =>
  orderbookStore.buys
    .slice(0, 1000)
    .reverse()
    .filter(
      (item) =>
        Number(item.price) > lastTradedPrice.value.toNumber() * (1 - PERCENTAGE)
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
        Number(item.price) < lastTradedPrice.value.toNumber() * (1 + PERCENTAGE)
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
    height: isMobile.value ? 400 : 550,
    redrawOnParentResize: true,
    redrawOnWindowResize: true,

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
    max: lastTradedPrice.value.toNumber() * (1 + PERCENTAGE),
    min: lastTradedPrice.value.toNumber() * (1 - PERCENTAGE),
    decimalsInFloat: priceDecimals.value
  },

  yaxis: {
    opposite: true,
    decimalsInFloat: quantityDecimals.value
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

watch(isMobile, (isMobile) => {
  chart?.updateOptions({
    chart: {
      height: isMobile ? 400 : 550
    }
  })
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
