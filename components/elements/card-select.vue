<template>
  <div
    class="group px-4 py-5 w-full border-t-4 cursor-pointer shadow-card text-gray-200 bg-gray-800"
    :class="{
      'border-primary-500 rounded-b-md': isSelected,
      'border-transparent rounded-b-md opacity-50 rounded-t-md hover:border-primary-500 hover:rounded-b-md hover:rounded-t-none hover:opacity-100': !isSelected
    }"
    @click="$emit('selected', option)"
  >
    <div class="-mt-1">
      <slot name="subtitle"></slot>
      <div class="flex items-center" :class="{ 'justify-between': lg }">
        <span
          class="rounded-full block mr-4"
          :class="[
            lg ? 'w-14 h-14' : 'w-6 h-6',
            {
              'bg-primary-500': isSelected,
              'bg-gray-600  group-hover:bg-primary-500': !isSelected
            }
          ]"
        ></span>

        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  model: {
    prop: 'value',
    event: 'selected'
  },

  props: {
    value: {
      required: true,
      type: [String, Number]
    },

    option: {
      required: true,
      type: [String, Number]
    },

    lg: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    isSelected(): boolean {
      return this.option === this.value
    }
  }
})
</script>
