<script setup lang="ts">
import { LineType } from 'lightweight-charts'

const leaderboardStore = useLeaderboardStore()

const data = computed(() => leaderboardStore.historicalBalance)
</script>

<template>
  <div>
    <AppLightweightChartArea
      v-bind="{
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
          lineColor: '#0EE29Baa',
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
