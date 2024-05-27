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
  <NuxtLink :to="url" target="_blank" class="card px-4 py-6 hover:bg-gray-750">
    <div class="flex space-x-4">
      <div class="relative mt-1">
        <slot />
      </div>

      <div>
        <p class="text-xl font-semibold">{{ title }}</p>
        <p v-if="description" class="text-gray-400 text-xs">
          {{ description }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 mt-8">
      <slot name="content" />
    </div>
  </NuxtLink>
</template>
