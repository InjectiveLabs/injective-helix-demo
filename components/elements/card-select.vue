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
      <div v-if="status.isLoading()" class="h-16 w-full relative mr-auto">
        <v-loading left />
      </div>
      <div v-else class="flex items-center" :class="{ 'justify-between': lg }">
        <span
          class="rounded-full block mr-4"
          :class="[
            lg ? 'w-12 h-12' : 'w-6 h-6',
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
import Vue, { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'
import VLoading from '~/components/elements/loading.vue'

export default Vue.extend({
  components: {
    VLoading
  },

  model: {
    prop: 'value',
    event: 'selected'
  },

  props: {
    status: {
      required: false,
      type: Object as PropType<Status>,
      default: () => new Status()
    },

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
