<script lang="ts" setup>
withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: ''
  }
)
</script>

<template>
  <div
    class="flex max-lg:justify-between text-xs lg:flex-col lg:justify-center lg:gap-y-2 lg:p-2"
  >
    <slot name="title">
      <span v-if="title" class="text-coolGray-400">{{ title }}</span>
    </slot>

    <slot />
  </div>
</template>
