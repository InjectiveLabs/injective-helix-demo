<script lang="ts" setup>
const props = defineProps({
  value: {
    type: String,
    required: true
  },

  modelValue: {
    type: String,
    required: true
  },

  activeClasses: {
    type: String,
    default: ''
  }
})

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
  <button v-bind="$attrs" :class="[isActive && activeClasses]" @click="onClick">
    <slot v-bind="{ isActive }" />
  </button>
</template>
