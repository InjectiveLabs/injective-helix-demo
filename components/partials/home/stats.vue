<template>
  <div>
    <div class="w-full xl:w-2/3">
      <h3 class="text-xl font-bold text-gray-200">
        {{ $t('injective_home_title_1') }}
      </h3>
      <p class="mt-2 text-sm text-gray-400">
        {{ $t('injective_home_subtitle_1') }}
      </p>
    </div>

    <v-card class="mt-6">
      <div
        class="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-6"
      >
        <v-stat-item class="col-span-2 md:col-span-3" sm>
          <template slot="value">
            <span
              class="font-mono font-bold text-xl xl:text-2xl text-primary-500"
            >
              24/7
            </span>
          </template>
          <template slot="title">
            {{ $t('trading') }}
          </template>
        </v-stat-item>
        <v-stat-item class="col-span-2 md:col-span-3" sm>
          <template slot="value">
            <span
              class="font-mono font-bold text-xl xl:text-2xl text-primary-500"
            >
              20x+
            </span>
          </template>
          <template slot="title">
            {{ $t('leverage') }}
          </template>
        </v-stat-item>
        <v-stat-item class="col-span-2 md:col-span-3" sm>
          <template slot="value">
            <span
              class="font-mono font-bold text-2xl xl:text-3xl text-primary-500"
            >
              &#8734;
            </span>
          </template>
          <template slot="title">
            {{ $t('markets') }}
          </template>
        </v-stat-item>
        <v-stat-item class="col-span-2 md:col-span-3" sm>
          <template slot="value">
            <span
              class="font-mono font-bold text-xl xl:text-2xl text-primary-500"
            >
              0
            </span>
          </template>
          <template slot="title">
            {{ $t('gas_fees') }}
          </template>
        </v-stat-item>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VStatItem from '~/components/partials/common/stats/item.vue'

export default Vue.extend({
  components: {
    VStatItem
  }
})
</script>
