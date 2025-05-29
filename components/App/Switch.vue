<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    isDisabled?: boolean
  }>(),
  {}
)

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
    class="w-8 h-5 rounded-full bg-coolGray-600 relative checkbox-base transition-all flex items-center"
  >
    <input
      v-model="value"
      :disabled="isDisabled"
      type="checkbox"
      class="absolute inset-0 z-10 opacity-0"
      :class="[isDisabled ? 'cursor-not-allowed' : 'cursor-pointer']"
    />
    <div
      class="h-4 w-4 rounded-full bg-white translate-x-0.5 [&+:checked]:translate-x-3.5 transition-all"
    />
  </div>
</template>

<style>
.checkbox-base:has(input:checked + div) {
  @apply bg-blue-500;
}

input:checked + div {
  @apply translate-x-3.5;
}
</style>
