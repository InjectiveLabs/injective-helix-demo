<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'

defineProps({
  active: Boolean,
  lg: Boolean,

  status: {
    required: false,
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})
</script>

<template>
  <div
    class="group w-full border-t-4 cursor-pointer shadow-card text-gray-100 bg-gray-900"
    :class="{
      'border-blue-500 rounded-b-md': active,
      'border-transparent rounded-b-md opacity-50 rounded-t-md hover:border-blue-500 hover:rounded-b-md hover:rounded-t-none hover:opacity-100':
        !active,
      'px-4 py-5': lg,
      'p-3 lg:px-4 lg:py-5': !lg
    }"
  >
    <div
      class="h-full flex flex-col"
      :class="{ 'min-w-2xs sm:min-w-full': lg }"
    >
      <slot name="subtitle" />

      <div
        class="flex items-center h-full gap-4"
        :class="{ 'justify-between': lg }"
      >
        <AppSpinner v-if="status.isLoading()" />

        <div
          v-else
          class="rounded-full mr-4 flex items-center justify-center"
          :class="[
            lg ? 'min-w-12 w-12 h-12' : 'w-4 h-4 md:w-6 md:h-6',
            {
              'bg-blue-500 text-blue-900': active,
              'bg-gray-600 group-hover:bg-blue-850': !active
            }
          ]"
        >
          <slot name="icon" />
        </div>

        <slot />
      </div>
    </div>
  </div>
</template>
