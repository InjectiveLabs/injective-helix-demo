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
      step="0.1"
      :value="leverage.toString()"
      @input="onLeverageChange"
    />
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
      this.$emit('change', value)
    }
  }
})
</script>
