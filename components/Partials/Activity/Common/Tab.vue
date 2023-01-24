<script lang="ts" setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },

  option: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'selected', state: string): void
}>()

function handleClick() {
  emit('selected', props.option)
}
</script>

<template>
  <span
    class="text-xs xs:text-sm leading-5 tracking-wide cursor-pointer uppercase"
    :class="[
      option === modelValue
        ? 'text-blue-500 hover:text-blue-600 font-bold'
        : 'text-gray-500 hover:text-blue-500'
    ]"
    @click="handleClick"
  >
    <slot />
  </span>
</template>
