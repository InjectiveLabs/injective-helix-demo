<template>
  <button
    type="button"
    role="button"
    class="uppercase rounded-2xl text-xs tracking-wide outline-none bg-gray-900 focus:outline-none"
    :class="{
      'px-5 py-2 text-xs': !xs,
      'px-2 py-2 text-2xs': xs,
      'text-gray-100  shadow-sm': isSelected && !primary && !red && !aqua,
      'text-gray-300': !isSelected,
      'border border-aqua-500 text-aqua-500': isSelected && aqua,
      'border border-primary-500 text-primary-500': isSelected && primary,
      'border border-red-500 text-red-500': isSelected && red
    }"
    @click="$emit('selected', option)"
  >
    <slot></slot>
  </button>
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
      required: true,
      type: [String, Number]
    },

    option: {
      required: true,
      type: [String, Number]
    },

    primary: {
      type: Boolean,
      required: false,
      default: false
    },

    xs: {
      type: Boolean,
      required: false,
      default: false
    },

    aqua: {
      type: Boolean,
      required: false,
      default: false
    },

    red: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    isSelected(): boolean {
      return this.option === this.value
    }
  }
})
</script>
