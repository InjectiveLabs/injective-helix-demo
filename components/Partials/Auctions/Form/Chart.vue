<script setup lang="ts">
import ApexCharts, { ApexOptions } from 'apexcharts'

const amount = ref(8.42)
const target = ref(null)
const chart = ref<null | ApexCharts>(null)

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
    padding: { left: 0, right: 0, bottom: 0, top: 0 }
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
      formatter: (val) => Number(val).toFixed(2)
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
  [amount, target],
  () => {
    if (chart.value) {
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
          offsetY: 55,
          borderRadius: 15
        }
      })

      chart.value.addXaxisAnnotation({
        x: 5.22,
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
          text: 5.22,
          orientation: 'landscape',
          borderRadius: 15
        }
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
          borderRadius: 10
        }
      })

      chart.value.addXaxisAnnotation({
        x: 5.22,
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
          borderRadius: 10
        }
      })
    }
  },
  { immediate: true }
)
</script>

<template>
  <!-- <input v-model.number="amount" type="range" min="3" max="10" /> -->
  <div id="auction-chart" ref="target"></div>
</template>
