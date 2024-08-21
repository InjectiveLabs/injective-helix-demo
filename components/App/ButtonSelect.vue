<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    value: string
    modelValue: string
    activeClasses?: string
  }>(),
  {
    activeClasses: ''
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
    v-bind="$attrs"
    :class="[
      isActive && activeClasses,
      { 'cursor-not-allowed': $attrs.disabled }
    ]"
    @click="onClick"
  >
    <slot v-bind="{ isActive }" />
  </button>
</template>
