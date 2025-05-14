<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    index: number
    modelValue: string
  }>(),
  {}
)

const emit = defineEmits<{
  'on:paste': [value: string]
  'on:change': [value: number]
  'on:backspace': [index: number]
  'update:modelValue': [value: string]
  'on:fillNext': [{ value: string; index: number }]
}>()

const inputRef = ref<null | HTMLInputElement>(null)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement

  if (target.value === '') {
    emit('update:modelValue', target.value)
    emit('on:backspace', props.index - 1)

    return
  }

  emit('on:change', props.index + 1)
  emit('update:modelValue', target.value)
}

function onPaste(event: ClipboardEvent) {
  if (!event.clipboardData) {
    return
  }

  event.preventDefault()

  const value = event.clipboardData.getData('text')

  const is6Digits = /^\d{6}$/.test(value)

  if (!is6Digits) {
    return
  }

  emit('on:paste', value)
}

function onKeyDown(event: KeyboardEvent) {
  const key = event.key
  const validNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const isPaste = (event.ctrlKey || event.metaKey) && key === 'v'

  if (key === 'Backspace') {
    if (!props.modelValue) {
      event.preventDefault()
      emit('on:backspace', props.index - 1)
    }
    return
  }

  const isValidInput = [
    ['Tab', 'End', 'Home', 'Delete', 'ArrowLeft', 'ArrowRight'],
    ...validNumbers
  ].includes(key)

  if (props.modelValue && validNumbers.includes(key)) {
    event.preventDefault()

    if (props.index < 5) {
      emit('on:fillNext', { value: key, index: props.index + 1 })
    }

    return
  }

  if (!isValidInput && !isPaste) {
    event.preventDefault()
  }
}

defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>

<template>
  <input
    ref="inputRef"
    :value="modelValue"
    type="text"
    max-length="1"
    pattern="[0-9]*"
    inputmode="numeric"
    class="w-10 h-12 text-center text-2xl border border-gray-600 rounded focus:outline-none focus:border-blue-500 bg-transparent font-semibold"
    @input="onInput"
    @paste="onPaste"
    @keydown="onKeyDown"
  />
</template>
