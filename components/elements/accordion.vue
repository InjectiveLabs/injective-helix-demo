<template>
  <div class="pt-6">
    <dt class="text-lg">
      <button
        class="text-left w-full flex justify-between items-start text-gray-200"
        :aria-expanded="isOpen"
        @click="$emit('togglePanel')"
      >
        <div class="font-semibold text-gray-200 flex items-start">
          <slot name="title" />
          <slot name="badge" />
        </div>
        <span class="ml-6 h-7 flex items-center">
          <svg
            class="h-6 w-6 transform"
            :class="{
              'rotate-180': isOpen
            }"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
    </dt>
    <dd v-show="isOpen" class="mt-2 pr-12">
      <p class="text-base text-gray-200">
        <slot />
      </p>
    </dd>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    isOpen: {
      required: true,
      default: false,
      type: Boolean
    }
  }
})
</script>
