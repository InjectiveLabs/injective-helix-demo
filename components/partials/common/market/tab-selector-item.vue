<template>
  <span
    class="text-xs leading-4 tracking-widest cursor-pointer uppercase"
    :class="[
      option === value
        ? 'text-gray-200 hover:text-gray-100 font-bold'
        : 'text-gray-500 hover:text-gray-200'
    ]"
    @click="$emit('selected', option)"
  >
    <slot />
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  model: {
    prop: 'value',
    event: 'selected'
  },
  props: {
    value: {
      type: String,
      required: true
    },
    option: {
      type: String,
      required: true
    }
  }
})
</script>
