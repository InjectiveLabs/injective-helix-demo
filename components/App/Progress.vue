<script lang="ts" setup>
const props = defineProps({
  value: {
    type: Number,
    required: true
  }
})

const style = computed(() => {
  return `transform: scaleX(${props.value / 100})`
})
</script>

<template>
  <div class="w-full flex flex-col items-end">
    <span class="text-gray-200 mb-1">{{ value }}%</span>
    <div class="w-full h-2 rounded bg-gray-700 overflow-hidden">
      <div class="w-full h-2 bg-white origin-top-left" :style="style" />
    </div>
  </div>
</template>
