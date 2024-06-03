<script setup lang="ts">
const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})
</script>

<template>
  <div
    class="w-8 h-4 rounded-full bg-gray-600 relative checkbox-base transition-all"
  >
    <input
      v-model="value"
      type="checkbox"
      class="absolute inset-0 z-10 opacity-0 cursor-pointer"
    />
    <div
      class="h-4 w-4 rounded-full bg-white [&+:checked]:translate-x-4 transition-all"
    />
  </div>
</template>

<style>
.checkbox-base:has(input:checked + div) {
  @apply bg-blue-500;
}

input:checked + div {
  @apply translate-x-4;
}
</style>
