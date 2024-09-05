<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: string
    label: string
    modelValue: string[]
  }>(),
  {}
)

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
    <span class="text-xs lg:text-sm font-semibold min-w-0 truncate">{{
      label
    }}</span>
  </label>
</template>
