<template>
  <div class="bg-gray-900 p-4 rounded-lg">
    <h4 class="text-gray-500 text-xs uppercase">
      {{ $t('dmm.summary.tokensDistributionTitle') }}
    </h4>

    <div class="relative h-3 mt-4">
      <span
        class="absolute text-2xs"
        :style="{ left: `calc(${past}%/2 - 11px)` }"
      >
        {{ past }}%
      </span>
      <span
        class="absolute text-2xs"
        :style="{ left: `calc(${current}%/2 + ${past}% - 11px)` }"
      >
        {{ current }}%
      </span>
      <span
        class="absolute text-2xs"
        :style="{
          left: `calc(${upcoming}%/2 + ${current}% + ${past}% - 11px)`
        }"
      >
        {{ upcoming }}%
      </span>
    </div>

    <div class="relative overflow-x-hidden h-4 my-3">
      <div
        v-tooltip="{ content: $t('dmm.epoch.pastEpoch') }"
        class="h-4 cursor-pointer absolute bg-primary-700 w-full"
        :style="{ left: '0%', width: `${past}%` }"
      />
      <div
        v-tooltip="{ content: $t('dmm.epoch.currentEpoch') }"
        class="h-4 cursor-pointer absolute bg-primary-500 w-full"
        :style="{ left: `${past}%`, width: `${current}%` }"
      />
      <div
        v-tooltip="{ content: $t('dmm.epoch.upcomingEpoch') }"
        class="h-4 cursor-pointer absolute bg-gray-400 w-full"
        :style="{ left: `${100 - upcoming}%`, width: `${upcoming}%` }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {},

  data() {
    return {
      past: 33,
      current: 3.5
    }
  },

  computed: {
    upcoming(): number {
      const { past, current } = this

      return 100 - past - current
    }
  }
})
</script>
