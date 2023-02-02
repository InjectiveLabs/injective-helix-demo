<script lang="ts" setup>
defineProps({
  link: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div
    class="border border-gray-700 hover:border-blue-500 py-4 px-2 rounded-lg cursor-pointer"
  >
    <a :href="link" target="_blank">
      <div
        class="text-blue-900 bg-blue-500 hover:bg-blue-200 rounded-full mx-auto w-12 h-12 flex items-center justify-center"
      >
        <slot name="icon" />
      </div>
      <h3 class="mt-4 font-semibold text-center text-base">
        <slot name="title" />
      </h3>
      <p class="text-xs text-gray-300 text-center">
        <slot />
      </p>
    </a>
  </div>
</template>
