<template>
  <li>
    <div
      class="block hover:bg-gray-800 cursor-pointer px-6"
      @click="handleClick"
    >
      <div class="flex items-center py-4">
        <div class="min-w-0 flex-1 flex items-center">
          <div class="flex-shrink-0 mr-2 text-gray-200">
            <slot name="icon"></slot>
          </div>
          <div
            class="min-w-0 flex-1 px-4 md:grid md:grid-cols-1 md:gap-4 text-left"
          >
            <div>
              <p class="text-xl font-semibold text-white flex items-center gap-1">
                <slot name="title"></slot>
              </p>
              <div class="flex items-center text-sm text-gray-500">
                <slot name="description"></slot>
                <slot name="addon"></slot>
              </div>
            </div>
          </div>
        </div>
        <div>
          <IconCaretDown class="transform -rotate-90 h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
})
</script>
