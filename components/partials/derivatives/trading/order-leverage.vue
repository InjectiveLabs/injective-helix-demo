<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="pt-1">
    <div>
      <h3
        class="text-xs text-gray-400"
        v-html="$t('trade.max_leverage', { max: maxLeverage })"
      ></h3>
    </div>
    <InputSlider
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
          :max="maxLeverage.toString()"
          class="leverage-input pr-4"
          data-cy="trading-page-leverage-input"
          @input="(e) => onLeverageChange(e.target.value)"
        />
        <span
          class="absolute top-0 right-0 text-xs text-gray-400 mt-1.5 mr-1.5"
        >
          x
        </span>
      </div>
    </InputSlider>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import InputSlider from '~/components/inputs/slider.vue'

export default Vue.extend({
  components: {
    InputSlider
  },

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
