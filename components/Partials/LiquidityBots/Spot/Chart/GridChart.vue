<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import ApexChart, { ApexOptions } from 'apexcharts'
import { BigNumberInBase } from '@injectivelabs/utils'
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

const spotStore = useSpotStore()
const exchangeStore = useExchangeStore()
const { subaccountPortfolioBalanceMap } = useBalance()

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
    liquidityValues: LiquidityValues
    activeStrategy?: TradingStrategy
    lastTradedPrice: BigNumberInBase
  }>(),
  {
    activeStrategy: undefined
  }
)

const apexChart = ref(undefined as ApexChart | undefined)

const { formattedStrategies } = useSpotGridStrategies(
  computed(() => props.activeStrategy),
  subaccountPortfolioBalanceMap
)

const strategy = computed(() => formattedStrategies.value[0])

const priceSeries = computed(() => {
  const market = exchangeStore.marketsHistory.find(
    (m) => m.marketId === props.market.marketId
  )

  if (!market) return []

  return market.time.map((time, i) => [time * 1000, market.highPrice[i]])
})

const upperTrailingBound = computed(() => {
  return strategy.value
    ? new BigNumberInBase(strategy.value.trailingUpper ?? '')
    : props.liquidityValues.trailingUpperBound
})

const lowerTrailingBound = computed(() => {
  return strategy.value
    ? new BigNumberInBase(strategy.value.trailingLower ?? '')
    : props.liquidityValues.trailingLowerBound
})

const upperBound = computed(() => {
  return strategy.value
    ? new BigNumberInBase(strategy.value.upperBound)
    : props.liquidityValues.upperBound
})

const lowerBound = computed(() => {
  return strategy.value
    ? new BigNumberInBase(strategy.value.lowerBound)
    : props.liquidityValues.lowerBound
})

const gridLevelsAnnotations = computed(() => {
  if (!lowerBound.value || !upperBound.value) {
    return []
  }

  return calculateGridLevels(
    lowerBound.value.toNumber(),
    upperBound.value.toNumber(),
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
        index === 0
          ? `Lower Price: ${level}`
          : index === array.length - 1
          ? `Upper Price: ${level}`
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
  const hasTrailingBounds = strategy.value
    ? strategy.value.trailingUpper && strategy.value.trailingLower
    : true

  if (
    !upperTrailingBound.value ||
    !lowerTrailingBound.value ||
    !hasTrailingBounds
  ) {
    return []
  }

  return [
    {
      y: upperTrailingBound.value.toNumber(),
      y2: lowerTrailingBound.value.toNumber(),
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

const ordersAnnotations = computed(() => {
  if (!props.activeStrategy) {
    return []
  }

  return spotStore.subaccountOrders.map((order) => {
    const price = sharedToBalanceInToken({
      value: order.price,
      decimalPlaces:
        props.market.quoteToken.decimals - props.market.baseToken.decimals
    })

    const isBuy = order.orderSide === 'buy'

    return {
      y: price,
      borderColor: isBuy ? colors.green[500] : colors.red[500],
      fillColor: isBuy ? colors.green[500] : colors.red[500],
      opacity: 0.1
    }
  })
})

const boundsAnnotations = computed(() => {
  if (!strategy.value) {
    return []
  }

  return [
    {
      y: strategy.value.upperBound,
      y2: strategy.value.lowerBound,
      strokeDashArray: 0,
      fillColor: colors.red[500],
      opacity: 0.2,
      label: {
        position: 'right',
        textAnchor: 'end',
        offsetX: -10,
        borderColor: colors.red[500],
        text: 'Grid Bound',
        style: {
          background: colors.red[500],
          color: '#000'
        }
      }
    }
  ]
})

const currentPriceAnnotation = computed(() => {
  return {
    y: props.liquidityValues.currentPrice.toNumber(),
    borderColor: colors.blue[500],
    label: {
      borderColor: colors.blue[500],
      text: 'Current Price',
      style: {
        background: colors.blue[500],
        color: '#000'
      }
    }
  }
})

const options = computed<ApexOptions>(() => ({
  chart: {
    height: 500,
    width: '100%',
    type: 'area',
    background: 'transparent',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    }
  },
  theme: { mode: 'dark' },

  dataLabels: { enabled: false },

  yaxis: {
    forceNiceScale: true,

    max:
      upperTrailingBound.value.times(1.05).toNumber() ||
      upperBound.value.times(1.05).toNumber(),
    min:
      lowerTrailingBound.value.times(0.95).toNumber() ||
      lowerBound.value.times(0.95).toNumber(),
    stepSize: 10,
    tooltip: {
      enabled: true
    }
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
      ...trailingBoundAnnotation.value,
      ...ordersAnnotations.value,
      ...boundsAnnotations.value,
      currentPriceAnnotation.value
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
  },
  tooltip: {
    y: {
      formatter: (value) => {
        return `${value}`
      }
    },
    followCursor: true
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
  () => [
    props.market,
    exchangeStore.marketsHistory,
    props.liquidityValues,
    spotStore.subaccountOrders,
    props.activeStrategy
  ],
  () => {
    apexChart.value?.updateOptions({
      ...options.value
    })
  }
)
</script>

<template>
  <div>
    <div id="lp-grid-chart"></div>
  </div>
</template>
