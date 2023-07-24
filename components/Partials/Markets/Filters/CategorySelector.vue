<script lang="ts" setup>
import { PropType } from 'vue'
import { MarketCategoryType } from '@/types'

const props = defineProps({
  active: Boolean,

  type: {
    type: String as PropType<MarketCategoryType>,
    required: true
  }
})

const emit = defineEmits<{
  click: [state: string]
}>()

function handleTypeClick() {
  emit('click', props.type)
}
</script>

<template>
  <span
    class="text-xs cursor-pointer select-none px-3 py-2 rounded font-medium"
    :class="[
      active
        ? 'bg-blue-500 bg-opacity-20 text-blue-500  hover:text-blue-600'
        : 'text-gray-300  hover:text-blue-500'
    ]"
    @click="handleTypeClick"
  >
    <slot />
  </span>
</template>
