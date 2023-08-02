<script setup lang="ts">
import ApexCharts, { ApexOptions } from 'apexcharts'
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
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

const amount = ref(8.4)
const target = ref(null)
const chart = ref<null | ApexCharts>(null)

const orderbookBuysFormatted = computed(() =>
  (spotStore.orderbook?.buys || []).map((order) => ({
    price: new BigNumberInBase(order.price)
      .times(
        new BigNumber(10).exponentiatedBy(
          props.market.baseToken.decimals - props.market.quoteToken.decimals
        )
      )
      .toFixed(2),
    quantity: new BigNumberInWei(order.quantity)
      .toBase(props.market.baseToken.decimals)
      .toFixed(2)
  }))
)

const currentBid = computed(() => 8.5)

const options = computed<ApexOptions>(() => ({
  series: [
    {
      name: 'Amount',
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148].reverse()
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
      // shadeIntensity: 1,
      opacityFrom: 0.8,
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
    type: 'numeric'
  },

  yaxis: {
    labels: {
      show: false
    }
  },
  tooltip: {
    // enabled: false
    x: {
      formatter: (val) => val.toFixed(2)
    }
  }

  // annotations: {
  //   xaxis: [
  //     {
  //       x: 5,
  //       strokeDashArray: 2,
  //       borderColor: '#775DD0',
  //       label: {
  //         borderColor: '#775DD0',
  //         style: {
  //           color: '#fff',
  //           background: '#775DD0',
  //           padding: { bottom: 5, left: 5, right: 5, top: 5 }
  //         },
  //         text: 'Current Bid',
  //         orientation: 'landscape',
  //         borderRadius: 10
  //       }
  //     },
  //     {
  //       x: amount.value,
  //       strokeDashArray: 2,
  //       borderColor: '#338811',
  //       label: {
  //         borderColor: '#775DD0',
  //         style: {
  //           color: '#fff',
  //           background: '#338811',
  //           padding: { bottom: 5, left: 5, right: 5, top: 5 }
  //         },
  //         text: 'Your Bid',
  //         orientation: 'landscape',
  //         offsetY: 40,
  //         borderRadius: 10
  //       }
  //     }
  //   ]
  // }
}))

onMounted(() => {
  chart.value = new ApexCharts(target.value, options.value)
  chart.value.render()
})

onUnmounted(() => {
  chart.value && chart.value.destroy()
})

watch(
  [amount, target, orderbookBuysFormatted],
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

      // orderbook update
      chart.value.updateSeries([
        {
          name: 'Amount',
          data: orderbookBuysFormatted.value.map((buy) => Number(buy.quantity))
        }
      ])
      chart.value.clearAnnotations()

      // Price Anotations

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
          text: currentBid.value,
          orientation: 'landscape',
          borderRadius: 15
        },
        id: 'currentBid'
      })

      // Text Anotations

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
            // padding: { bottom: 5, left: 5, right: 5, top: 5 }
          },
          text: 'Your Bid',
          orientation: 'landscape',
          offsetY: 0,
          borderRadius: 10,
          id: 'yourBidText'
        }
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
  },
  { immediate: true }
)
</script>

<template>
  <div class="-ml-11 -mr-10">
    <!-- <input
      v-model.number="amount"
      type="range"
      :min="Math.min(...orderbookBuysFormatted.map((buy) => Number(buy.price)))"
      :max="Math.max(...orderbookBuysFormatted.map((buy) => Number(buy.price)))"
      step="0.01"
    /> -->
    <div id="auction-chart" ref="target"></div>
  </div>
</template>
