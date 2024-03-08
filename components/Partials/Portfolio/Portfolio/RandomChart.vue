<script setup lang="ts">
import { LineType } from 'lightweight-charts'

const randomData = () => {
  const data: { value: number; time: number }[] = []
  for (let i = 0; i < 400; i++) {
    data.push({
      value:
        i === 0
          ? Math.floor(Math.random() * 100)
          : data[i - 1].value + Math.random() * 10 - 5,
      time: new Date().getTime() / 1000 + i * 1000
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
        chartOptions: {
          handleScale: false,
          handleScroll: false
        },
        seriesOptions: {
          lineColor: '#0EE29Baa',
          lineType: LineType.Curved,
          lineWidth: 2
        },
        data,
        priceScaleOptions: {
          visible: true,
          borderColor: 'transparent'
        },
        height: 200
      }"
    />
  </div>
</template>
