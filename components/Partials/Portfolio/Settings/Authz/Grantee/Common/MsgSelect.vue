<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
    required: true
  },

  value: {
    type: String,
    required: true
  },

  label: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const computedValue = computed({
  get: () => props.modelValue.includes(props.value),
  set: (value: boolean) => {
    const modelValue = props.modelValue.slice()

    if (value) {
      modelValue.push(props.value)
    } else {
      modelValue.splice(modelValue.indexOf(props.value), 1)
    }

    emit('update:modelValue', modelValue)
  }
})
</script>

<template>
  <label class="select-none flex space-x-1">
    <AppSwitch v-model="computedValue" />
    <span class="text-sm min-w-0 truncate">{{ label }}</span>
  </label>
</template>
