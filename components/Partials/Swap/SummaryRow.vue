<script lang="ts" setup>
defineProps({
  isAlignStart: Boolean,

  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div
    class="flex justify-between text-sm gap-4"
    :class="[isAlignStart ? 'items-start' : 'items-center']"
  >
    <span class="text-gray-400 whitespace-nowrap">{{ title }}</span>
    <span class="leading-5 text-gray-200 truncate"><slot /></span>
  </div>
</template>
