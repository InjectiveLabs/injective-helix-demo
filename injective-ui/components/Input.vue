<script lang="ts" setup>
import type { PasteEvent } from './../types'

const props = defineProps({
  isClearedOnPaste: Boolean,

  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  // Legacy
  paste: []
  input: [value: string]
  pasted: [value: string]

  'input:changed': [value: string]
  'update:modelValue': [state: string]
}>()

function onChange(event: any) {
  const { value } = event.target

  emit('update:modelValue', value)
  emit('input:changed', value)

  // Legacy
  emit('input', value)
}

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  if (!clipboardData) {
    return
  }

  if (props.isClearedOnPaste) {
    const value = clipboardData.getData('text')
    event.preventDefault()

    // Legacy
    emit('paste')
    emit('pasted', value)
    emit('update:modelValue', value)

    return
  }

  // Legacy
  emit('paste')
}
</script>

<template>
  <input
    class="input-base"
    v-bind="$attrs"
    :value="modelValue"
    @paste="onPaste"
    @input="onChange"
  />
</template>
