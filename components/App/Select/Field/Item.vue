<script lang="ts" setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },

  value: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
}>()

const isActive = computed(() => {
  return props.modelValue === props.value
})

function handleClick() {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <div
    class="p-2 hover:bg-blue-500 hover:text-blue-900 rounded text-white text-sm font-semibold cursor-pointer"
    @click="handleClick"
  >
    <slot :active="isActive" />
  </div>
</template>
