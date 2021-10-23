<template>
  <v-button
    :class="{
      'text-gray-500': component !== option
    }"
    text-sm
    class="font-normal"
    @click.stop="onSelect"
  >
    <slot></slot>
  </v-button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  model: {
    prop: 'component',
    event: 'select'
  },

  props: {
    option: {
      type: String,
      required: true
    },

    component: {
      type: String,
      required: true
    }
  },

  methods: {
    onSelect() {
      this.$emit('select', this.option)
    }
  }
})
</script>
