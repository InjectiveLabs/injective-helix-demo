<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { OrderSide, OrderState } from '@injectivelabs/ts-types'
import { BigNumberInWei } from '@injectivelabs/utils'
import ApexChart, { ApexOptions } from 'apexcharts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from 'app/utils/constants'
import { addressAndMarketSlugToSubaccountId } from 'app/utils/helpers'

type OrderAnnotation = {
  y: number
  borderColor: string
  label: {
    borderColor: string
    style: {
      color: string
      background: string
    }
    text: string
    position?: string
    offsetX?: number
    textAnchor?: string
  }
}

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const spotStore = useSpotStore()
const walletStore = useWalletStore()
const exchangeStore = useExchangeStore()
const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))
const { t } = useLang()

let chart: ApexChart

const priceSerie = computed(() => {
  const market = exchangeStore.marketsHistory.find(
    (m) => m.marketId === props.market.marketId
  )!

  const serie = []

  for (let i = 0; i < market.highPrice.length; i++) {
    serie.push([market.time[i] * 1000, market.highPrice[i]])
  }

  return serie
})

const subaccountMarketOrders = computed(() =>
  spotStore.subaccountOrderHistory.filter(
    (order) =>
      order.marketId === props.market.marketId &&
      order.subaccountId ===
        addressAndMarketSlugToSubaccountId(
          walletStore.address,
          props.market.slug
        ) &&
      order.state === OrderState.Booked
  )
)

const ordersAnnotations = computed(() => {
  return subaccountMarketOrders.value.map(
    (order): OrderAnnotation => ({
      y: new BigNumberInWei(order.price)
        .toBase(
          props.market.quoteToken.decimals - props.market.baseToken.decimals
        )
        .toNumber(),
      borderColor: '#ffffff48',
      label: {
        borderColor: order.direction === OrderSide.Sell ? '#ff1111' : '#00a153',
        text:
          order.direction === OrderSide.Sell ? t('trade.sell') : t('trade.buy'),
        style: {
          background:
            order.direction === OrderSide.Sell ? '#ff111155' : '#00a15355',
          color: 'white'
        },
        position: 'left',
        offsetX: 0,
        textAnchor: 'start'
      }
    })
  )
})

const minMaxRange = computed(() => {
  if (subaccountMarketOrders.value.length < 2) {
    return { max: undefined, min: undefined }
  }

  const range = subaccountMarketOrders.value.map((o) =>
    new BigNumberInWei(o.price)
      .toBase(
        props.market.quoteToken.decimals - props.market.baseToken.decimals
      )
      .toNumber()
  )

  return {
    min: Math.min(...range, lastTradedPrice.value.toNumber()) * 0.99,
    max: Math.max(...range, lastTradedPrice.value.toNumber()) * 1.01
  }
})

const currentPriceAnnotation = computed<OrderAnnotation>(() => ({
  y: lastTradedPrice.value.toNumber(),
  borderColor: '#00a153',
  strokeDashArray: 0,
  label: {
    borderColor: '#00a153',
    text: lastTradedPrice.value.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS),
    position: 'right',
    style: {
      background: '#00a153',
      color: 'white'
    }
  }
}))

const options = computed<ApexOptions>(() => ({
  chart: {
    height: 300,
    width: '100%',
    type: 'area',
    background: 'transparent',
    toolbar: {
      show: false
    },
    redrawOnWindowResize: true
  },

  theme: { mode: 'dark' },

  dataLabels: { enabled: false },

  xaxis: { type: 'datetime' },

  yaxis: {
    opposite: true,
    min: minMaxRange.value.min,
    max: minMaxRange.value.max,
    tooltip: {
      enabled: true
    },
    tickAmount: 10
  },

  grid: {
    yaxis: { lines: { show: false } }
  },

  stroke: { width: 1 },

  tooltip: {
    followCursor: true
  },

  series: [{ data: priceSerie.value, name: 'Price' }],

  annotations: {
    yaxis: [...ordersAnnotations.value, currentPriceAnnotation.value]
  }
}))

onMounted(() => {
  chart = new ApexChart(
    document.getElementById('liquidity-chart'),
    options.value
  )

  chart.render()
})

onUnmounted(() => {
  chart.destroy()
})

watch(
  () => [spotStore.subaccountOrderHistory, lastTradedPrice.value],
  () => {
    chart.updateOptions(options.value)
  }
)
</script>

<template>
  <div v-show="subaccountMarketOrders.length > 0" id="liquidity-chart"></div>
</template>
