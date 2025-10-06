<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },

  value: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits<{
  'update:modelValue': [state: string | number]
}>()

const isActive = computed(() => props.modelValue === props.value)

function click() {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <div @click="click">
    <slot :is-active="isActive" />
  </div>
</template>
