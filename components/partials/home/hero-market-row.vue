<template>
  <div
    class="grid grid-cols-12 items-center border-b border-helixGray-200 last-of-type:border-b-0 py-4 gap-12 box-content"
  >
    <div class="col-span-4 flex items-center justify-start pl-4">
      <div class="min-w-4 min-h-4 bg-orange-500 rounded-full mr-3" />
      <div class="flex flex-col">
        <span
          class="text-helixGray-500 text-sm font-bold whitespace-nowrap mb-1"
        >
          BTC/USDT PERP
        </span>
        <span class="text-helixGray-300 text-xs"> Bitcoin </span>
      </div>
    </div>
    <div class="col-span-3 flex">
      <span class="w-full text-gray-900 font-medium text-sm text-right">
        20,866.45
      </span>
    </div>
    <div class="col-span-2 flex">
      <span class="w-full text-red-500 font-medium text-sm"> -4.59% </span>
    </div>
    <div class="col-span-3 flex text-red-500 pr-4 h-7">
      <LineGraph
        :data="chartData"
        :stroke-width="1"
        :smoothness="0.2"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// @ts-ignore
import { LineGraph } from 'vue-plot'

export default Vue.extend({
  components: {
    LineGraph
  },

  data() {
    return {
      chartData: [
        [0, 670.083],
        [63, 648.297],
        [126, 609.14],
        [189, 618.952],
        [252, 544.733],
        [315, 521.324],
        [378, 521.982],
        [441, 465.814],
        [504, 493.411],
        [567, 371.442],
        [630, 466.558],
        [693, 302.238],
        [756, 345.249],
        [819, 329.911],
        [882, 259.528],
        [945, 145.526],
        [1008, 110.93],
        [1071, 179.909],
        [1134, 186.363],
        [1197, 50]
      ]
    }
  }
})
</script>
