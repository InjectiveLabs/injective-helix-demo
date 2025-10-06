<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import {
  stripNonDigits,
  convertToNumericValue,
  passNumericInputValidation
} from './../utils/input'
import type { PasteEvent, KeydownEvent } from './../types'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },

  maxDecimals: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits<{
  'update:modelValue': [state: string]
}>()

const debounceSanitizeDecimalPlace = useDebounceFn((value: string) => {
  const formattedValue = convertToNumericValue(
    value,
    props.maxDecimals
  ).toString()

  emit('update:modelValue', formattedValue)
}, 500)

function onWheel(event: WheelEvent) {
  event.preventDefault()
}

function onChange(event: any) {
  const { value } = event.target

  emit('update:modelValue', value)
  debounceSanitizeDecimalPlace(value)
}

function onKeyDown(payload: KeyboardEvent) {
  const event = payload as KeydownEvent<HTMLInputElement>

  if (
    !passNumericInputValidation(event, props.maxDecimals === 0 ? ['.'] : [])
  ) {
    event.preventDefault()
  }
}

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  event.preventDefault()

  if (clipboardData) {
    const value = clipboardData.getData('text')
    const digitOnlyValue = stripNonDigits(value).toString()
    const formattedValue = convertToNumericValue(
      digitOnlyValue,
      props.maxDecimals
    )

    emit('update:modelValue', `${formattedValue}`)
  }
}
</script>

<template>
  <input
    class="input-base"
    type="number"
    lang="en"
    v-bind="$attrs"
    :value="modelValue"
    @input="onChange"
    @paste="onPaste"
    @keydown="onKeyDown"
    @wheel="onWheel"
  />
</template>
