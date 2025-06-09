<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import { cx } from 'class-variance-authority'

const props = withDefaults(
  defineProps<{
    value: string
    modelValue: string
    activeClasses?: string
    class?: string | string[] | Record<string, boolean>
  }>(),
  {
    activeClasses: '',
    class: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isActive = computed(() => props.value === props.modelValue)

const onClick = () => {
  if (!isActive.value) {
    emit('update:modelValue', props.value)
  }
}
</script>

<template>
  <button
    :class="
      twMerge(
        cx([
          props.class,
          isActive && activeClasses,
          { 'cursor-not-allowed': $attrs.disabled }
        ])
      )
    "
    @click="onClick"
  >
    <slot v-bind="{ isActive }" />
  </button>
</template>
