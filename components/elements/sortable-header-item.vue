<template>
  <div class="flex items-center cursor-pointer select-none" @click="handleSort">
    <slot name="prefix" />
    <div class="mr-1">
      <div
        :class="{
          'text-gray-600': sortBy !== value || !ascending
        }"
      >
        <v-icon-triangle class="transform rotate-180 mb-1" />
      </div>
      <div
        :class="{
          'text-gray-600': sortBy !== value || ascending
        }"
      >
        <v-icon-triangle />
      </div>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    value: {
      type: String,
      required: true
    },

    sortBy: {
      type: String,
      required: true
    },

    ascending: {
      type: Boolean,
      required: true
    }
  },

  methods: {
    handleSort() {
      const { value } = this

      this.$emit('sort', value)
    }
  }
})
</script>
