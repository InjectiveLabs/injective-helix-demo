<script setup lang="ts">
import ApexCharts, { ApexOptions } from 'apexcharts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  },

  bid: {
    type: String,
    default: '0'
  }
})

const spotStore = useSpotStore()

const target = ref(null)
const chart = ref<null | ApexCharts>(null)

const amount = computed(() => {
  if (spotStore.subaccountOrders.length > 0) {
    return new BigNumberInWei(spotStore.subaccountOrders[0].price)
      .toBase(
        props.market.quoteToken.decimals - props.market.baseToken.decimals
      )
      .toFixed(2)
  }

  return null
})

const orderbookBuysFormatted = computed(() =>
  (spotStore.orderbook?.buys || [])
    .map((order) => ({
      price: new BigNumberInWei(order.price)
        .toBase(
          props.market.quoteToken.decimals - props.market.baseToken.decimals
        )
        .toFixed(2),
      quantity: new BigNumberInWei(order.quantity)
        .toBase(props.market.baseToken.decimals)
        .toFixed(2)
    }))
    .filter((order) => Number(order.price) >= 1)
)

const currentBid = computed(() => {
  if (!spotStore.orderbook) {
    return 1
  }

  const TALIS_TOTAL_AMOUNT = 100000
  const TALIS_TOTAL_AMOINT_IN_WEI = new BigNumberInBase(TALIS_TOTAL_AMOUNT)
    .toWei(props.market.baseToken.decimals)
    .toNumber()

  let quantity = 0
  let currentBid = 1

  const orderbookSortedFromHighestBid = [...spotStore.orderbook.buys].sort(
    (a, b) => new BigNumberInBase(b.price).minus(a.price).toNumber()
  )

  for (const order of orderbookSortedFromHighestBid) {
    quantity += Number(order.quantity)

    if (quantity >= TALIS_TOTAL_AMOINT_IN_WEI) {
      currentBid = new BigNumberInWei(order.price)
        .toBase(
          props.market.baseToken.decimals - props.market.quoteToken.decimals
        )
        .toNumber()
      break
    }
  }

  return quantity < TALIS_TOTAL_AMOINT_IN_WEI ? 1 : currentBid
})

const options = computed<ApexOptions>(() => ({
  series: [
    {
      name: 'Amount',
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148].reverse(),
      group: 'amount'
    }
  ],

  chart: {
    height: 250,
    type: 'area',
    zoom: {
      enabled: false
    },
    toolbar: {
      show: false
    },
    background: 'transparent'
  },

  fill: {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.6,
      opacityTo: 0.3,
      stops: [0, 100]
    }
  },
  colors: ['#F3A400'],

  theme: { mode: 'dark' },

  dataLabels: {
    enabled: false
  },

  stroke: {
    curve: 'smooth',
    width: 2
  },

  grid: {
    show: false,
    padding: { left: 40, right: 40, bottom: 0, top: 0 }
  },

  xaxis: {
    categories: [1, 3, 5, 6, 7, 8, 9, 10, 12],
    min: 1,
    max: 12,
    type: 'numeric',
    decimalsInFloat: 2
  },

  yaxis: {
    labels: {
      show: false
    }
  },
  tooltip: {
    x: {
      formatter: (val) => val.toFixed(2)
    },
    y: {
      formatter: (val) => val.toFixed(2)
    }
  }
}))

onMounted(() => {
  chart.value = new ApexCharts(target.value, options.value)
  chart.value.render()
})

onUnmounted(() => {
  chart.value && chart.value.destroy()
})

watch(
  [amount, currentBid, target, orderbookBuysFormatted],
  () => {
    if (chart.value) {
      chart.value.updateOptions({
        xaxis: {
          categories: orderbookBuysFormatted.value.map((buy) =>
            Number(buy.price)
          ),
          min: Math.min(
            ...orderbookBuysFormatted.value.map((buy) => Number(buy.price))
          ),
          max: Math.max(
            ...orderbookBuysFormatted.value.map((buy) => Number(buy.price))
          ),
          type: 'numeric'
        }
      })

      chart.value.updateSeries([
        {
          name: 'Amount',
          data: orderbookBuysFormatted.value.map((buy) => Number(buy.quantity)),
          group: 'amount'
        }
      ])

      chart.value.clearAnnotations()

      if (amount.value) {
        chart.value.addXaxisAnnotation({
          x: amount.value,
          strokeDashArray: 2,
          borderColor: '#F3A400',
          label: {
            borderColor: '#F3A400',
            style: {
              color: '#fff',
              background: '#F3A400',
              padding: { bottom: 5, left: 10, right: 10, top: 5 },
              fontSize: '1rem'
            },
            text: amount.value,
            orientation: 'landscape',
            offsetY: 60,
            borderRadius: 15,
            id: 'yourBid'
          }
        })

        chart.value.addXaxisAnnotation({
          x: amount.value,
          strokeDashArray: 2,
          borderColor: '#F3A400',
          label: {
            borderColor: 'transparent',
            style: {
              color: '#F3A400',
              background: 'transparent',
              fontSize: '0.9rem'
            },
            text: 'Your Bid',
            orientation: 'landscape',
            offsetY: 85,
            borderRadius: 10,
            id: 'yourBidText'
          }
        })
      }

      if (currentBid.value) {
        chart.value.addXaxisAnnotation({
          x: currentBid.value,
          strokeDashArray: 2,
          borderColor: '#ffffff',
          label: {
            borderColor: '#ffffff',
            style: {
              color: '#000000',
              background: '#ffffff',
              padding: { bottom: 5, left: 10, right: 10, top: 5 },
              fontSize: '1rem'
            },
            offsetY: 30,
            text: currentBid.value.toFixed(2),
            orientation: 'landscape',
            borderRadius: 15
          },
          id: 'currentBid'
        })

        chart.value.addXaxisAnnotation({
          x: currentBid.value,
          strokeDashArray: 2,
          borderColor: '#ffffff33',
          label: {
            borderColor: 'transparent',
            style: {
              color: '#ffffff',
              background: 'transparent',
              fontSize: '0.9rem',
              padding: { bottom: 5, left: 5, right: 5, top: 5 }
            },
            text: 'Current Bid',
            orientation: 'landscape',
            borderRadius: 10,
            id: 'currentBidText'
          }
        })
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="-ml-11 -mr-10">
    <div id="auction-chart" ref="target"></div>
  </div>
</template>
