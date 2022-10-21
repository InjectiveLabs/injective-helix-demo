<template>
  <div>
    <slot name="options" :value="value" :setValue="setValue" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    value: {
      type: [Object, String, Number],
      default: 0
    }
  },

  methods: {
    setValue(value: any) {
      this.$emit('change', value)
    }
  }
})
</script>
