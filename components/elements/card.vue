<template>
  <div class="rounded-xl relative" :class="[bgColor, padding]">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    bgColor: {
      type: String,
      default: 'bg-helixGray-950'
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    lg: {
      type: Boolean,
      default: false
    },
    md: {
      type: Boolean,
      default: false
    },
    tight: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    padding(): any {
      const { lg, tight, md, noPadding } = this

      if (noPadding) {
        return 'p-0'
      }

      return {
        'p-4 lg:p-6': lg && !tight,
        'p-4': md && !tight,
        'p-2 lg:p-3': !md && !lg && !tight
      }
    }
  }
})
</script>
