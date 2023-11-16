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
  'update:modelValue': [state: string]
}>()

const isActive = computed(() => props.modelValue === props.value)

function click() {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <div
    class="p-2 hover:bg-blue-500 rounded text-white text-sm font-semibold cursor-pointer group"
    @click="click"
  >
    <slot :is-active="isActive" />
  </div>
</template>
