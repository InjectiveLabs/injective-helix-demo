<script setup lang="ts">
const props = defineProps({
  isBuy: Boolean,
  isActive: Boolean,

  index: {
    type: Number,
    default: -1
  }
})

const emit = defineEmits<{
  'set:index': [index: number]
}>()

function setIndex() {
  emit('set:index', props.index)
}
</script>

<template>
  <div
    class="flex text-xs text-right"
    :class="[isActive && 'bg-brand-800']"
    @mouseenter="setIndex"
  >
    <div
      class="flex-1 min-w-0 truncate"
      :class="[isBuy ? 'text-green-500' : 'text-red-500']"
    >
      12.32
    </div>
    <div class="flex-1 min-w-0 truncate">12.32</div>
    <div class="flex-1 min-w-0 truncate">12.32</div>
  </div>
</template>
