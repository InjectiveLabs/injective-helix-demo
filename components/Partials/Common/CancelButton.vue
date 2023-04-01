<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'

const props = defineProps({
  sm: Boolean,
  disabled: Boolean,

  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

function handleClick() {
  if (props.status.isLoading()) {
    return
  }

  emit('click')
}
</script>

<template>
  <div
    class="flex justify-end items-center"
    :class="{
      'h-5 w-5 min-h-5 min-w-6': sm,
      'h-6 w-6 min-h-6 min-w-6': !sm
    }"
    @click="handleClick"
  >
    <AppSpinner v-if="status.isLoading()" sm white />

    <div
      v-else
      class="cursor-pointer flex items-center justify-center rounded-full bg-opacity-10 hover:bg-opacity-30 h"
      :class="{
        'pointer-events-none cursor-not-allowed over:text-red-600 bg-gray-500 text-gray-500':
          disabled,
        'cursor-pointer over:text-red-600 bg-red-500 text-red-500': !disabled,
        'min-w-5 w-5 h-5': sm,
        'min-w-6 h-6 w-6': !sm
      }"
    >
      <slot name="icon">
        <BaseIcon name="bin" sm />
      </slot>
    </div>
  </div>
</template>
