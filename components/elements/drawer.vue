<template>
  <div>
    <div
      class="group flex justify-end w-full cursor-pointer relative"
      @click.stop="toggle"
    >
      <div class="max-w-full flex-1 pr-5">
        <slot name="header" />
      </div>
      <div class="absolute right-0 top-0 mt-1">
        <v-icon-caret-down
          class="text-gray-500 group-hover:text-gray-200 w-4 h-4"
          :class="{ 'transform rotate-180': drawerIsOpen }"
        />
      </div>
    </div>
    <div v-if="drawerIsOpen">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    customHandler: {
      required: false,
      type: Boolean,
      default: false
    },

    customIsOpen: {
      required: false,
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isOpen: false
    }
  },

  computed: {
    drawerIsOpen(): boolean {
      return this.customIsOpen || this.isOpen
    }
  },

  methods: {
    toggle() {
      if (this.customHandler) {
        this.$emit('drawer-toggle')
        return
      }
      this.isOpen = !this.isOpen
    }
  }
})
</script>
