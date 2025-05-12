<script lang="ts" setup>
import type { NotificationAction } from '@shared/types'

const props = withDefaults(
  defineProps<{
    action: NotificationAction
  }>(),
  {}
)

const emit = defineEmits<{
  'on:click': [value: NotificationAction]
}>()

function onClick() {
  emit('on:click', props.action)
}
</script>

<template>
  <button
    :class="action.class"
    class="text-sm font-semibold py-1 px-3 bg-[#A7C8FF] rounded-xl text-brand-800 hover:opacity-80 transition-opacity cursor-pointer"
    @click="onClick"
  >
    {{ action.label }}
  </button>
</template>
