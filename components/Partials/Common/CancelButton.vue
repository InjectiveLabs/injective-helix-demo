<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'

const props = defineProps({
  isSm: Boolean,
  isDisabled: Boolean,

  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})

const emit = defineEmits<{
  click: []
}>()

function click() {
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
      'h-5 w-5 min-h-5 min-w-6': isSm,
      'h-6 w-6 min-h-6 min-w-6': !isSm
    }"
    @click="click"
  >
    <AppSpinner v-if="status.isLoading()" is-sm is-white />

    <div
      v-else
      class="cursor-pointer flex items-center justify-center rounded-full bg-opacity-10 hover:bg-opacity-30 h"
      :class="{
        'pointer-events-none cursor-not-allowed over:text-red-600 bg-gray-500 text-gray-500':
          isDisabled,
        'cursor-pointer over:text-red-600 bg-red-500 text-red-500': !isDisabled,
        'min-w-5 w-5 h-5': isSm,
        'min-w-6 h-6 w-6': !isSm
      }"
    >
      <slot name="icon">
        <BaseIcon name="bin" is-sm />
      </slot>
    </div>
  </div>
</template>
