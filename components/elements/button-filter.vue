<template>
  <v-button
    text-sm
    :gray="component !== option"
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
