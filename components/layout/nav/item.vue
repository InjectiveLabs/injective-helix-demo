<template>
  <nuxt-link
    v-bind="$attrs"
    class="text-gray-200 hover:bg-[#202431] hover:text-white text-sm font-semibold rounded-lg cursor-pointer mx-px h-[41px] flex items-center"
    :class="classes"
    exact
    @click.native="handleClickEvent"
  >
    <span class="block">
      <slot></slot>
    </span>
  </nuxt-link>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    dense: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    classes(): string[] {
      const { dense } = this

      if (dense) {
        return ['hover:text-primary-500']
      }

      return ['px-6', 'py-2', 'hover:bg-[#202431]', 'hover:text-white']
    }
  },

  methods: {
    handleClickEvent() {
      this.$root.$emit('nav-link-clicked')
    }
  }
})
</script>
