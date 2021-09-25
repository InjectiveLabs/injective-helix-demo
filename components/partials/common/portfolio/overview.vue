<template>
  <div>
    <p class="text-xs uppercase text-gray-400">Portfolio value</p>
    <h2 class="mt-6 text-lg lg:text-2xl font-mono text-gray-100">
      15,887.000 USD
    </h2>
    <p class="mt-2 text-xs text-gray-400">
      <span class="text-aqua-500">+ $150.00 (5.27%)</span> in 24h
    </p>

    <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 mt-12">
      <v-item class="col-span-2 lg:col-span-6">
        <template slot="value"> - </template>
        <template slot="title"> Margin </template>
      </v-item>
      <v-item class="col-span-2 lg:col-span-6">
        <template slot="value"> - </template>
        <template slot="title"> Colateral </template>
      </v-item>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VItem from '~/components/partials/common/stats/item.vue'

export default Vue.extend({
  components: {
    VItem
  }
})
</script>
