<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  isOnRight: Boolean,
  isDisabled: Boolean,
  modelValue: Boolean
})

const emits = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isChecked = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    if (!props.isDisabled) {
      emits('update:modelValue', value)
    }
  }
})
</script>

<template>
  <label class="relative">
    <div
      class="flex gap-2 items-center"
      :class="[
        { 'flex-row-reverse': isOnRight },
        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
      ]"
    >
      <slot name="checkbox" v-bind="{ isChecked, isDisabled }" />

      <div class="flex items-center">
        <slot />
      </div>
    </div>

    <input v-model="isChecked" type="checkbox" class="hidden" />
  </label>
</template>
