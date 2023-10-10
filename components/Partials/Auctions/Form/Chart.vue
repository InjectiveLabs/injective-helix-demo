<script setup lang="ts">
import ApexCharts, { ApexOptions } from 'apexcharts'
import { BigNumberInWei } from '@injectivelabs/utils'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { OrderState } from '@injectivelabs/ts-types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from 'app/utils/constants'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  },

  currentProjectedPrice: {
    type: Number,
    required: true
  }
})

const spotStore = useSpotStore()
const route = useRoute()
const walletStore = useWalletStore()

const target = ref(null)
const chart = ref<null | ApexCharts>(null)

const isBlurred = computed(
  () => !walletStore.isUserWalletConnected || route.query.isUpcoming === 'true'
)

const yourBidsSorted = computed(() =>
  [...spotStore.subaccountOrders]
    .filter((bid) =>
      [OrderState.Booked, OrderState.PartiallyFilled].includes(bid.state)
    )
    .sort((a, b) => {
      return Number(a.price) - Number(b.price)
    })
    .map((bid) =>
      new BigNumberInWei(bid.price)
        .toBase(
          props.market.quoteToken.decimals - props.market.baseToken.decimals
        )
        .toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    )
)

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

const options = computed<ApexOptions>(() => ({
  series: [
    {
      name: 'Amount',
      data: [],
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
      opacityFrom: 0.8,
      opacityTo: 0.6,
      stops: [0, 100]
    }
  },
  colors: ['#0EE29B'],

  theme: { mode: 'dark' },

  dataLabels: {
    enabled: false
  },

  stroke: {
    curve: 'stepline',
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
  [yourBidsSorted, props, target, orderbookBuysFormatted],
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

      if (isBlurred.value) return

      if (props.currentProjectedPrice) {
        chart.value.addXaxisAnnotation({
          x: props.currentProjectedPrice,
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
            orientation: 'landscape',
            borderRadius: 15
          },
          id: 'currentBid'
        })
      }

      for (const [index, bid] of [...yourBidsSorted.value]
        .reverse()
        .entries()) {
        chart.value.addXaxisAnnotation({
          x: bid,
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
            text: index === yourBidsSorted.value.length - 1 ? bid : undefined,
            orientation: 'landscape',
            offsetY: 60,
            borderRadius: 15,
            id: 'yourBid'
          }
        })
      }

      if (props.currentProjectedPrice) {
        chart.value.addXaxisAnnotation({
          x: props.currentProjectedPrice,
          strokeDashArray: 2,
          borderColor: 'transparent',
          label: {
            borderColor: 'transparent',
            style: {
              color: '#ffffff',
              background: 'transparent',
              fontSize: '0.9rem',
              padding: { bottom: 5, left: 5, right: 5, top: 5 }
            },
            text: 'Projected Price',
            orientation: 'landscape',
            borderRadius: 10,
            id: 'currentBidText'
          }
        })

        chart.value.addXaxisAnnotation({
          x: props.currentProjectedPrice,
          strokeDashArray: 2,
          borderColor: '#ffffff00',
          label: {
            borderColor: '#ffffff',
            style: {
              color: '#000000',
              background: '#ffffff',
              padding: { bottom: 5, left: 10, right: 10, top: 5 },
              fontSize: '1rem'
            },
            offsetY: 30,
            text: props.currentProjectedPrice.toFixed(2),
            orientation: 'landscape',
            borderRadius: 15
          },
          id: 'currentBid'
        })
      }

      for (const [index, bid] of yourBidsSorted.value.entries()) {
        if (index === 0) {
          chart.value.addXaxisAnnotation({
            x: bid,
            strokeDashArray: 2,
            borderColor: 'transparent',
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
      }
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="-ml-11 -mr-10">
    <div id="auction-chart" ref="target"></div>
  </div>
</template>
