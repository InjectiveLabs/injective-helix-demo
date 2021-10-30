<template>
  <div>
    <div class="flex flex-wrap -mx-4">
      <div class="w-full lg:w-2/3 flex flex-col px-4">
        <v-overview class="w-full" />
        <v-chart class="flex-1 mt-6" />
      </div>
      <div class="w-full lg:w-1/3 px-4">
        <v-stats />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VOverview from './summary/overview.vue'
import VChart from './summary/chart.vue'
import VStats from './summary/stats.vue'

export default Vue.extend({
  components: {
    VOverview,
    VChart,
    VStats
  }
})
</script>
