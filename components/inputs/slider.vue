<template>
  <div class="range-wrap flex items-center relative select-none">
    <input
      v-bind="$attrs"
      class="range"
      :value="value"
      type="range"
      @input="handleChange"
    />
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { BigNumber } from '@injectivelabs/utils'
import Vue from 'vue'

export default Vue.extend({
  inheritAttrs: false,

  model: {
    prop: 'value',
    event: 'input'
  },

  props: {
    value: {
      required: true,
      type: String
    }
  },

  methods: {
    handleChange(e: Event) {
      const value = new BigNumber((e.target as HTMLFormElement).value)

      this.$emit('input', value.dp(2, BigNumber.ROUND_HALF_CEIL).toFixed())
    }
  }
})
</script>
