<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { OrderSide, OrderState } from '@injectivelabs/ts-types'
import { BigNumberInWei } from '@injectivelabs/utils'
import ApexChart, { ApexOptions } from 'apexcharts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'

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
const { t } = useLang()

const GREEN_COLOR = '#0EE29B'
const RED_COLOR = '#F3164D'
const OPACITY_HEX = '60'

const apexChart = ref(undefined as ApexChart | undefined)

const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))

const DAY = 1000 * 60 * 60 * 24

const timerangeOptions = [
  { value: DAY, display: '1D' },
  { value: DAY * 3, display: '3D' },
  { value: DAY * 7, display: '1W' },
  { value: DAY * 30, display: '1M' }
]

const range = ref(DAY)

const priceSeries = computed(() => {
  const market = exchangeStore.marketsHistory.find(
    (m) => m.marketId === props.market.marketId
  )!

  return market.time.map((time, i) => [time * 1000, market.highPrice[i]])
})

const subaccountMarketOrders = computed(() =>
  spotStore.subaccountOrders.filter(
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

const ordersAnnotations = computed(() =>
  subaccountMarketOrders.value.map(
    (order): OrderAnnotation => ({
      y: new BigNumberInWei(order.price)
        .toBase(
          props.market.quoteToken.decimals - props.market.baseToken.decimals
        )
        .toNumber(),
      borderColor: '#F8F8F848',
      label: {
        borderColor:
          order.orderSide === OrderSide.Sell ? RED_COLOR : GREEN_COLOR,
        text:
          order.orderSide === OrderSide.Sell ? t('trade.sell') : t('trade.buy'),
        style: {
          background:
            order.orderSide === OrderSide.Sell
              ? RED_COLOR + OPACITY_HEX
              : GREEN_COLOR + OPACITY_HEX,
          color: 'white'
        },
        position: 'left',
        offsetX: 0,
        textAnchor: 'start'
      }
    })
  )
)

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
    min: Math.min(...range) * 0.99,
    max: Math.max(...range) * 1.01
  }
})

const currentPriceAnnotation = computed<OrderAnnotation>(() => ({
  y: lastTradedPrice.value.toNumber(),
  borderColor: GREEN_COLOR,
  strokeDashArray: 0,
  label: {
    borderColor: GREEN_COLOR,
    text: lastTradedPrice.value.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS),
    position: 'right',
    style: {
      background: GREEN_COLOR,
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
      show: false,
      autoSelected: 'pan'
    },
    redrawOnWindowResize: true
  },

  theme: { mode: 'dark' },

  dataLabels: { enabled: false },

  xaxis: {
    type: 'datetime',
    labels: { datetimeUTC: false },
    tooltip: { enabled: true },
    range: range.value
  },

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

  series: [{ data: priceSeries.value, name: 'Price' }],

  annotations: {
    yaxis: [...ordersAnnotations.value, currentPriceAnnotation.value]
  }
}))

onMounted(() => {
  apexChart.value = new ApexChart(
    document.getElementById('liquidity-chart'),
    options.value
  )

  apexChart.value.render()
})

onUnmounted(() => {
  apexChart.value?.destroy()
})

function setRange(time: number) {
  range.value = time
}

watch(
  () => [spotStore.subaccountOrderHistory, lastTradedPrice.value, range.value],
  () => {
    apexChart.value?.updateOptions(options.value)
  }
)
</script>

<template>
  <div>
    <div class="flex justify-end">
      <div class="mt-4 px-1 py-0.5 bg-black rounded overflow-hidden">
        <button
          v-for="{ display, value } in timerangeOptions"
          :key="`option-${display}`"
          class="text-[11px] rounded-sm px-1 py-0.5 min-w-10 font-bold"
          :class="{ 'bg-gray-700': range === value }"
          @click="setRange(value)"
        >
          {{ display }}
        </button>
      </div>
    </div>
    <div id="liquidity-chart"></div>
  </div>
</template>
