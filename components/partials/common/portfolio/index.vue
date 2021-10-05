<template>
  <v-card class="mt-6">
    <div class="flex flex-wrap -mx-4">
      <div class="w-full lg:w-1/4 px-4">
        <v-overview />
      </div>
      <div class="w-full lg:w-3/4 px-4">
        <v-stats />
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import VOverview from './overview.vue'
import VStats from './stats.vue'

export default Vue.extend({
  components: {
    VOverview,
    VStats
  }
})
</script>
