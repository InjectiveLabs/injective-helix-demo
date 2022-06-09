<template>
  <v-button
    :disabled="false"
    :ghost="false"
    primary
    class="rounded-md text-md h-[34px] p-0 tracking-wider col-span-2 flex items-center justify-center hover:bg-primary-500 hover:bg-opacity-10 hover:border hover:border-primary-600 hover:text-primary-600"
    :class="classes"
    @click.stop="handleClick"
  >
    {{ label }}%
  </v-button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    label: {
      type: String,
      required: true
    },

    value: {
      type: String,
      required: true
    },

    active: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    classes(): string {
      return this.active
        ? 'text-primary-600 bg-primary-500 bg-opacity-10 border border-primary-600 cursor-default'
        : 'bg-gray-700 text-gray-400'
    }
  },

  methods: {
    handleClick() {
      this.$emit('click', this.value)
    }
  }
})
</script>
