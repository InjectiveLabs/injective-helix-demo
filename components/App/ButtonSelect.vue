<script lang="ts" setup>
import { cx } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const props = withDefaults(
  defineProps<{
    value: string
    modelValue: string
    class?: string | string[] | Record<string, boolean>
    activeClasses?: string
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
