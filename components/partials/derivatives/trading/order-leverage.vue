<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="pt-1">
    <div>
      <v-ui-text
        muted-md
        tag="h3"
        v-bind="{ '2xs': true }"
        v-html="$t('max_leverage', { max: maxLeverage })"
      >
      </v-ui-text>
    </div>
    <v-input-slider
      min="1"
      :max="maxLeverage.toString()"
      step="0.01"
      :value="leverage.toString()"
      @input="onLeverageChange"
    >
      <div class="relative">
        <input
          ref="leverage-input"
          :value="leverage"
          type="number"
          min="0"
          step="0.01"
          max="maxLeverage.toString()"
          class="leverage-input pr-4"
          @input="(e) => onLeverageChange(e.target.value)"
        />
        <span class="absolute top-0 right-0 text-xs text-gray-400 mt-1 mr-1"
          >x</span
        >
      </div>
    </v-input-slider>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  model: {
    prop: 'leverage',
    event: 'change'
  },

  props: {
    maxLeverage: {
      required: true,
      type: String
    },

    leverage: {
      required: true,
      type: String
    }
  },

  methods: {
    onLeverageChange(value: string) {
      if (!Number.isNaN(value)) {
        this.$emit('change', value)
        this.$forceUpdate()
      }
    }
  }
})
</script>
