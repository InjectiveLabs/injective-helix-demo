<template>
  <v-icon-check-circle
    v-tooltip="{ content: tooltip }"
    v-bind="$attrs"
    :class="classes"
    class="fill-current text-primary-500"
    v-on="$listeners"
  />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    tooltip: {
      required: false,
      default: '',
      type: String
    },

    lg: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    classes(): string[] {
      return this.lg ? ['w-4', 'w-4'] : ['w-3', 'w-3']
    }
  }
})
</script>
