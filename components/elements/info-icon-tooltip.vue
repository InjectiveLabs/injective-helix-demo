<template>
  <v-icon-info
    v-tooltip="{ content: tooltip }"
    v-bind="$attrs"
    :class="[classes, color]"
    class="fill-current"
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
    },

    color: {
      type: String,
      default: 'text-gray-500'
    }
  },

  computed: {
    classes(): string[] {
      return this.lg ? ['min-w-4', 'w-4', 'w-4'] : ['min-w-3', 'w-3', 'w-3']
    }
  }
})
</script>
