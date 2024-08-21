<script lang="ts" setup>
import { MarketCategoryType } from '@/types'

const props = withDefaults(
  defineProps<{
    isActive?: boolean
    type: MarketCategoryType
  }>(),
  {
    isActive: false
  }
)

const emit = defineEmits<{
  click: [state: string]
}>()

function click() {
  emit('click', props.type)
}
</script>

<template>
  <span
    class="text-xs cursor-pointer select-none px-3 py-2 rounded font-medium"
    :class="[
      isActive
        ? 'bg-blue-500 bg-opacity-20 text-blue-500  hover:text-blue-600'
        : 'text-gray-300  hover:text-blue-500'
    ]"
    @click="click"
  >
    <slot />
  </span>
</template>
