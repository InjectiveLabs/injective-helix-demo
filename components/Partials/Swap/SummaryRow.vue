<script lang="ts" setup>
withDefaults(
  defineProps<{
    title: string
    isAlignStart?: boolean
  }>(),
  {
    isAlignStart: false
  }
)
</script>

<template>
  <div
    class="flex justify-between text-sm gap-4"
    :class="[isAlignStart ? 'items-start' : 'items-center']"
  >
    <span class="text-coolGray-400 whitespace-nowrap">{{ title }}</span>
    <span class="leading-5 text-coolGray-200 truncate"><slot /></span>
  </div>
</template>
