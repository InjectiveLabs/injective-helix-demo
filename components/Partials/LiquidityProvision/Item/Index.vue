<script setup lang="ts">
defineProps({
  url: {
    type: [String, Object],
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <NuxtLink :to="url" target="_blank" class="card-opaque px-6 py-4">
    <div class="flex items-center relative">
      <div class="relative">
        <slot />
      </div>

      <div class="ml-4">
        <p class="text-lg font-semibold">{{ title }}</p>
        <p v-if="description" class="text-gray-400 text-xs">
          {{ description }}
        </p>
      </div>

      <div class="ml-auto">
        <slot name="source" />
      </div>
    </div>

    <div class="grid grid-cols-2 mt-6">
      <slot name="content" />
    </div>
  </NuxtLink>
</template>
