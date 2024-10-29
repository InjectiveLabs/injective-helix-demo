<script lang="ts" setup>
import { SharedDropdownOption } from '@shared/types'

const props = withDefaults(
  defineProps<{
    options: SharedDropdownOption[] | undefined
    modelValue?: string
    wrapperClass?: string
    contentClass?: string
    startPlacement?: boolean
  }>(),
  {
    modelValue: '',
    wrapperClass: '',
    contentClass: '',
    startPlacement: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [state: string]
}>()

const formattedOptions = computed(() =>
  (props.options || []).map((option) => ({
    label: `${option.display}`,
    id: option.value
  }))
)

const value = computed({
  get: () =>
    formattedOptions.value.find((option) => option.id === props.modelValue),
  set: (value) => emit('update:modelValue', value?.id || '')
})
</script>

<template>
  <USelectMenu
    v-model="value"
    class="w-44"
    :options="formattedOptions"
    :popper="{ placement: startPlacement ? 'bottom-start' : 'bottom-end' }"
  >
  </USelectMenu>
</template>
