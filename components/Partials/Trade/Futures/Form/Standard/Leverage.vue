<script setup lang="ts">
const leverage = ref('1')
</script>

<template>
  <p class="field-label mb-2">{{ $t('trade.leverage') }}</p>
  <div class="flex items-center">
    <div class="flex-1 pr-4 relative">
      <div
        class="absolute top-2 bottom-3 right-4 inset-x-0 bg-brand-800 rounded-md"
      />

      <input
        v-model="leverage"
        min="0"
        max="10"
        step="0.1"
        type="range"
        class="range w-full"
      />
    </div>

    <label class="field-style flex px-3 basis-20 min-w-0 h-12">
      <input
        v-model="leverage"
        type="text"
        class="min-w-0 bg-transparent focus:outline-none font-mono text-sm text-right"
      />
      <span class="flex items-center pl-2">x</span>
    </label>
  </div>
</template>
