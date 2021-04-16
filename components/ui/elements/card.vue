<template>
  <div :class="classes" class="bg-dark-700 border" v-on="$listeners">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    small: {
      required: false,
      type: Boolean,
      default: false
    },

    medium: {
      required: false,
      type: Boolean,
      default: false
    }
  },

  computed: {
    classes(): string {
      const classes = ['shadow-inner', 'rounded']

      return classes.join(' ')
    }
  }
})
</script>
