<template>
  <span
    class="px-2 py-1 min-w-6 leading-4 rounded-sm"
    :class="{
      'text-gray-300 bg-blue-100': active,
      'hover:text-gray-300 hover:bg-blue-100': !active && isPage,
      'cursor-pointer': isPage
    }"
    @click="handleClickEvent"
  >
    {{ page }}
  </span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    active: {
      type: Boolean,
      default: false
    },

    page: {
      type: [Number, String],
      required: true
    }
  },

  computed: {
    isPage(): boolean {
      const { page } = this

      return page !== '...'
    }
  },

  methods: {
    handleClickEvent() {
      const { page, isPage } = this

      if (isPage) {
        this.$emit('click', page)
      }
    }
  }
})
</script>
