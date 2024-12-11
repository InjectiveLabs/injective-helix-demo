<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  {
    description: ''
  }
)
</script>

<template>
  <div class="card-opaque px-6 py-4 cursor-pointer">
    <div class="flex items-center relative">
      <div class="relative">
        <slot />
      </div>

      <div class="ml-4">
        <p class="text-lg font-semibold">{{ title }}</p>
        <p v-if="description" class="text-coolGray-400 text-xs">
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
  </div>
</template>
