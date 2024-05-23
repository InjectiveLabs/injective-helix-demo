<script setup lang="ts">
import { BaseDropdownOption } from '@injectivelabs/ui-shared'

const props = defineProps({
  options: {
    type: Array as PropType<BaseDropdownOption[]>,
    required: true
  },

  modelValue: {
    type: String,
    required: true
  },

  placement: {
    type: String,
    default: 'bottom-start'
  },

  wrapperClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selected = computed(() =>
  props.options.find((option) => option.value === props.modelValue)
)
</script>

<template>
  <BaseDropdown
    position="bottom-left"
    :placement="placement"
    :distance="0"
    class="flex"
    :class="wrapperClass"
  >
    <template #default="{ isOpen }">
      <div class="tab-label px-4 flex w-full">
        <slot v-bind="{ isOpen, selected }" />
        <div class="flex items-center pl-2">
          <div class="transition-all" :class="{ 'rotate-180': isOpen }">
            <SharedIcon is-sm name="chevron-down" />
          </div>
        </div>
      </div>
    </template>

    <template #content="{ close }">
      <div class="border bg-brand-900 divide-y">
        <div
          v-for="option in options"
          :key="option.value"
          class="px-6 py-4 hover:bg-brand-800 text-xs font-semibold cursor-pointer text-white"
          @click="
            () => {
              emit('update:modelValue', option.value)
              close()
            }
          "
        >
          <slot name="option" v-bind="{ option }" />
        </div>
      </div>
    </template>
  </BaseDropdown>
</template>
