<template>
  <span
    class="leading-5 tracking-wide text-xs cursor-pointer uppercase select-none"
    :class="[
      active
        ? 'text-primary-500  hover:text-primary-600'
        : 'text-gray-500  hover:text-primary-500'
    ]"
    @click="handleTypeClick"
  >
    <slot />
  </span>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MarketQuoteType } from '~/types'

export default Vue.extend({
  props: {
    type: {
      type: String as PropType<MarketQuoteType>,
      required: true
    },

    active: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleTypeClick() {
      this.$emit('click', this.type)
    }
  }
})
</script>
