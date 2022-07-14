<template>
  <span
    class="text-xs leading-4 cursor-pointer uppercase"
    :class="[
      option === value
        ? 'text-primary-500 hover:text-primary-600 font-semibold'
        : 'text-gray-500 hover:text-primary-500'
    ]"
    @click="handleClickEvent"
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
  },

  methods: {
    handleClickEvent() {
      const { option } = this

      this.$emit('selected', option)
    }
  }
})
</script>
