<template>
  <div class="rounded-2xl bg-transparent shadow-card p-4 bg-white bg-opacity-5">
    <p class="tracking-widest uppercase text-gray-500 text-xs">
      <slot />
    </p>
    <div class="flex justify-between mt-4">
      <div class="flex items-center">
        <div v-if="market.market.baseToken.logo" class="w-10 h-10 mr-3">
          <img
            :src="market.market.baseToken.logo"
            :alt="market.market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div>
          <p class="uppercase tracking-widest text-sm font-bold">
            {{ market.market.ticker }}
          </p>
          <span class="text-xs text-gray-500 capitalize">
            {{ market.market.baseToken.name }}
          </span>
        </div>
      </div>
      <!-- V2: spark line chart -->
    </div>

    <p
      class="text-2xl tracking-wide font-mono font-light flex items-center mt-4"
      :class="{
        'text-aqua-500 ': market.summary.lastPriceChange !== Change.Increase,
        'text-red-500': market.summary.lastPriceChange === Change.Decrease
      }"
    >
      <v-icon-arrow
        class="transform w-5 h-5 mr-1"
        :class="{
          'rotate-90': market.summary.lastPriceChange !== Change.Increase,
          ' -rotate-90': market.summary.lastPriceChange === Change.Decrease
        }"
      />

      {{ market.summary.price }}
    </p>
    <div class="flex items-center font-mono text-sm tracking-wide mt-2">
      <span
        class="mr-2"
        :class="{
          'text-aqua-500 ': market.summary.lastPriceChange !== Change.Increase,
          'text-red-500': market.summary.lastPriceChange === Change.Decrease
        }"
      >
        {{ market.summary.change }}%
      </span>
      <span class="text-gray-500">VOL {{ market.summary.volume }}USD</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Change, UiMarketAndSummary } from '~/types'

export default Vue.extend({
  props: {
    market: {
      type: Object as PropType<UiMarketAndSummary>,
      required: true
    }
  },

  data() {
    return {
      Change
    }
  }
})
</script>
