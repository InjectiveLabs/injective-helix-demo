<template>
  <div>
    <h3 class="text-xl font-bold text-gray-200">
      {{ $t('Portfolio') }}
    </h3>
    <v-card class="mt-6">
      <div class="flex flex-wrap -mx-4">
        <div class="w-full lg:w-2/5 px-4">
          <v-overview />
        </div>
        <div class="w-full lg:w-3/5 px-4">
          <v-chart />
        </div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VOverview from './overview.vue'
import VChart from './chart.vue'

export default Vue.extend({
  components: {
    VOverview,
    VChart
  }
})
</script>
