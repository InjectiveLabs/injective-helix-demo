<script setup lang="ts">
import { LineType } from 'lightweight-charts'

const randomData = () => {
  const data = []
  for (let i = 0; i < 30; i++) {
    data.push({
      value: Math.floor(Math.random() * 100),
      time: new Date().getTime() + i * 1000
    })
  }
  return data
}

const data = ref(randomData())
</script>

<template>
  <div>
    <AppLightweightChartArea
      v-bind="{
        seriesOptions: {
          lineColor: '#0EE29B',
          lineType: LineType.Curved,
          lineWidth: 1
        },
        data,
        priceScaleOptions: {
          visible: false
        },
        height: 200
      }"
    />
  </div>
</template>
