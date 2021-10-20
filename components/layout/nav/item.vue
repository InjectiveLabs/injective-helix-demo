<template>
  <nuxt-link
    v-bind="$attrs"
    class="text-gray-200 hover:bg-gray-800 hover:text-white flex items-center px-6 tracking-widest py-2 uppercase text-xs rounded mx-px"
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
  methods: {
    handleClickEvent() {
      this.$root.$emit('nav-link-clicked')
    }
  }
})
</script>
