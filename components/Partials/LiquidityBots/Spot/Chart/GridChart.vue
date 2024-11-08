<script setup lang="ts">
import ApexChart, { ApexOptions } from 'apexcharts'
import { LiquidityValues, UiMarketWithToken } from '@/types'
import { calculateGridLevels } from '@/app/data/grid-strategy'
import { colors } from '@/nuxt-config/tailwind'

type OrderAnnotation = {
  y: number
  borderColor: string
  label: {
    borderColor: string
    style: {
      color: string
      background: string
    }
    text?: string
    position?: string
    offsetX?: number
    textAnchor?: string
  }
}

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
    liquidityValues: LiquidityValues
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

const gridLevelsAnnotations = computed(() => {
  if (!props.liquidityValues.lowerBound || !props.liquidityValues.upperBound)
    return []

  return calculateGridLevels(
    props.liquidityValues.lowerBound.toNumber(),
    props.liquidityValues.upperBound.toNumber(),
    props.liquidityValues.grids
  ).map<OrderAnnotation>((level, index, array) => ({
    y: level,
    strokeDashArray: 2,

    borderColor:
      level > props.liquidityValues.currentPrice.toNumber()
        ? colors.red[500]
        : colors.green[500],
    label: {
      textAnchor: 'start',
      position: 'left',
      offsetY: index === 0 ? 20 : 0,
      borderColor:
        level > props.liquidityValues.currentPrice.toNumber()
          ? colors.red[500]
          : colors.green[500],
      text:
        // index === 0 || index === array.length - 1 ? level.toFixed() : undefined,
        index === 0
          ? `Lower Price: ${level.toFixed()}`
          : index === array.length - 1
          ? `Upper Price: ${level.toFixed()}`
          : undefined,
      style: {
        color: '#000',
        background:
          level > props.liquidityValues.currentPrice.toNumber()
            ? colors.red[500]
            : colors.green[500]
      }
    }
  }))
})

const trailingBoundAnnotation = computed(() => {
  if (
    !props.liquidityValues.trailingUpperBound ||
    !props.liquidityValues.trailingLowerBound
  )
    return []

  return [
    {
      y: props.liquidityValues.trailingUpperBound.toNumber(),
      y2: props.liquidityValues.trailingLowerBound.toNumber(),
      borderColor: colors.blue[500],
      fillColor: colors.green[500],
      opacity: 0.1,
      label: {
        borderColor: colors.green[500],
        text: 'Trailing Bound',

        style: {
          background: colors.green[500],
          color: '#000'
        }
      }
    }
  ]
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

  yaxis: {
    max: props.liquidityValues.currentPrice.times(1.3).toNumber(),
    min: props.liquidityValues.currentPrice.times(0.7).toNumber()
    // max: props.liquidityValues.trailingUpperBound.toNumber(),
    // min: props.liquidityValues.trailingLowerBound.toNumber()
  },

  xaxis: {
    type: 'datetime',
    labels: { datetimeUTC: false }
  },

  stroke: { width: 1, curve: 'straight' },

  series: [{ data: priceSeries.value, name: 'Price' }],

  annotations: {
    yaxis: [
      ...gridLevelsAnnotations.value,
      ...trailingBoundAnnotation.value
      // {
      //   y: 17,
      //   y2: 18,

      //   fillColor: '#3B7CFF',
      //   borderColor: '#3B7CFF',

      //   label: {
      //     borderColor: '#3B7CFF',

      //     text: 'Upper Lower',

      //     style: {
      //       background: '#3B7CFF',
      //       color: '#fff'
      //     }
      //   }
      // }
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
  () => [props.market, exchangeStore.marketsHistory, props.liquidityValues],
  () => {
    apexChart.value?.updateOptions({
      // series: [{ data: priceSeries.value, name: 'Price' }],
      // annotations: { yaxis: gridLevelsAnnotations.value }
      ...options.value
    })
  }
)
</script>

<template>
  <div id="lp-grid-chart"></div>
</template>
