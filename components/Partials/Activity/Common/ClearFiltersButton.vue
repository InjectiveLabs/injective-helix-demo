<script setup lang="ts">
const emit = defineEmits<{
  (e: 'clear'): void
}>()

function handleClear() {
  emit('clear')
}
</script>

<template>
  <div
    class="flex items-center text-sm cursor-pointer text-blue-500 hover:text-blue-600 whitespace-nowrap col-span-4 justify-center sm:col-span-1 sm:justify-start sm:h-10"
    @click="handleClear"
  >
    {{ $t('filters.clearAll') }}
  </div>
</template>
