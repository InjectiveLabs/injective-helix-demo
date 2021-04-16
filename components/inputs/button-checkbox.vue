<template>
  <div class="flex items-center py-1" @click="onToggle">
    <span class="mr-2 text-sm text-gray-300">{{ title }}</span>
    <button
      type="button"
      aria-pressed="false"
      class="relative inline-flex flex-shrink-0 h-6 w-12 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      :class="[checked ? 'bg-primary-600' : 'bg-gray-200']"
    >
      <span
        class="relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
        :class="[checked ? 'translate-x-6' : 'translate-x-0']"
      >
        <span
          class="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          aria-hidden="true"
          :class="[
            checked
              ? 'opacity-0 ease-out duration-100'
              : 'opacity-100 ease-in duration-200'
          ]"
        >
          <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span
          class="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          aria-hidden="true"
          :class="[
            checked
              ? 'opacity-100 ease-in duration-200'
              : 'opacity-0 ease-out duration-100'
          ]"
        >
          <svg
            class="h-3 w-3 text-primary-600"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path
              d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
            />
          </svg>
        </span>
      </span>
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  model: {
    prop: 'value',
    event: 'change'
  },

  props: {
    value: {
      required: true,
      type: Boolean
    },

    title: {
      required: true,
      type: String
    }
  },

  computed: {
    checked(): boolean {
      return this.value === true
    }
  },

  methods: {
    onToggle() {
      this.$emit('change', !this.checked)
    }
  }
})
</script>
