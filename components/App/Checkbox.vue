<script lang="ts" setup>
const props = withDefaults(
  defineProps<{ dataCy?: string; modelValue: boolean; isDisabled?: boolean }>(),
  {
    dataCy: 'unknown-id',
    isDisabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isChecked = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <UCheckbox
    v-bind="$attrs"
    v-model="isChecked"
    :disabled="isDisabled"
    class="relative"
  >
    <template v-if="$slots.default" #label>
      <span class="text-xs select-none">
        <slot />
      </span>
    </template>
  </UCheckbox>
</template>
