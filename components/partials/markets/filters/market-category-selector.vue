<template>
  <span
    class="text-xs cursor-pointer select-none px-3 py-2 rounded font-medium"
    :class="[
      active
        ? 'bg-primary-500 bg-opacity-20 text-primary-500  hover:text-primary-600'
        : 'text-gray-300  hover:text-primary-500'
    ]"
    @click="handleTypeClick"
  >
    <slot />
  </span>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MarketCategoryType } from '~/types'

export default Vue.extend({
  props: {
    type: {
      type: String as PropType<MarketCategoryType>,
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
