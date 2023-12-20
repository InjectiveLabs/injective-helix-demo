<script lang="ts" setup>
defineProps({
  isLg: Boolean,
  isSm: Boolean,

  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <p
    class="flex flex-wrap items-center w-full"
    :class="{
      'text-xs': !isLg && !isSm,
      'text-xs sm:text-sm': isSm,
      'text-base': isLg
    }"
  >
    <span class="opacity-75 flex items-center">
      {{ title }}
      <slot name="context" />
    </span>
    <span class="flex-grow border-b border-dashed mx-4"></span>
    <span class="text-gray-100 flex justify-end">
      <slot />
    </span>
  </p>
</template>
