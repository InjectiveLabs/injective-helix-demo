<template>
  <div class="flex items-center cursor-pointer" @click="$emit('sort', value)">
    <slot></slot>
    <div
      class="sorting-arrow ml-3"
      :class="{
        'sorting-arrow-up': sortBy === value && ascending,
        active: sortBy === value
      }"
    ></div>
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
  }
})
</script>
