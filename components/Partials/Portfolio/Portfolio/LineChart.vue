<script setup lang="ts">
import { LineType } from 'lightweight-charts'

defineProps({
  isPositive: Boolean,

  label: {
    type: String,
    required: true
  },

  data: {
    type: Array as PropType<
      {
        time: number
        value: number
      }[]
    >,
    required: true
  }
})

enum COLOR {
  green = '#0EE29B',
  red = '#FF4D4F'
}
</script>

<template>
  <div>
    <AppLightweightChartArea
      v-bind="{
        label,
        chartOptions: {
          handleScale: false,
          handleScroll: false,
          crosshair: {
            horzLine: {
              visible: false
            }
          },
          layout: {
            textColor: 'white'
          }
        },
        seriesOptions: {
          lineColor: isPositive ? COLOR.green : COLOR.red,
          bottomColor: 'transparent',
          topColor: isPositive ? COLOR.green : COLOR.red,
          lineType: LineType.Curved,
          lineWidth: 2
        },
        data,
        timeScaleOptions: {
          tickMarkFormatter: (time: number) => {
            const date = new Date(time * 1000)
            return date.toLocaleDateString('en-US', {
              dateStyle: 'short'
            })
          }
        },
        priceScaleOptions: {
          visible: false,
          borderColor: 'transparent'
        },

        height: 200,
        shouldFitContentOnResize: true
      }"
    />
  </div>
</template>
