<script setup lang="ts">
//
</script>

<template>
  <label
    class="flex focus-within:focus-ring transition-all duration-300 border border-brand-725 rounded-md bg-brand-875 text-sm py-2 px-4"
  >
    <div v-if="$slots.left" class="flex items-center">
      <slot name="left" />
    </div>

    <input
      type="text"
      class="bg-transparent p-2 flex-1 focus:outline-none font-mono"
      v-bind="$attrs"
    />

    <div v-if="$slots.right" class="flex items-center">
      <slot name="right" />
    </div>
  </label>
</template>
