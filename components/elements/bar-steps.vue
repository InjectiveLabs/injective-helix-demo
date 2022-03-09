<template>
  <div class="flex items-center">
    <div
      class="flex items-center justify-center bg-black h-6 min-w-6 cursor-pointer"
      @click="handleClickPrev"
    >
      <v-icon-chevron class="w-2 h-2" />
    </div>

    <div class="h-1 relative bg-gray-500 w-full mx-4">
      <span
        class="block h-full transition-all duration-300 ease-in-out bg-primary-500"
        :style="{ width: `${progress}%` }"
      />
    </div>
    <div
      class="flex items-center justify-center bg-black h-6 min-w-6 cursor-pointer"
      @click="handleClickNext"
    >
      <v-icon-chevron class="w-2 h-2 rotate-180" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    steps: {
      type: Number,
      required: true
    },

    activeStep: {
      type: Number,
      required: true
    }
  },

  computed: {
    progress(): number {
      const { steps, activeStep } = this

      return (activeStep / steps) * 100
    }
  },

  methods: {
    handleClickPrev() {
      const { activeStep } = this

      if (activeStep !== 1) {
        this.$emit('change', activeStep - 1)
      }
    },

    handleClickNext() {
      const { activeStep, steps } = this

      if (activeStep !== steps) {
        this.$emit('change', activeStep + 1)
      }
    }
  }
})
</script>
