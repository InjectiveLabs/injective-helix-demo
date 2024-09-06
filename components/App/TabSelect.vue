<script setup lang="ts">
import { SharedDropdownOption } from '@shared/types'

const props = withDefaults(
  defineProps<{
    options: SharedDropdownOption[]
    modelValue: string
    placement?: string
    wrapperClass?: string
  }>(),
  {
    placement: 'bottom-start',
    wrapperClass: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selected = computed(() =>
  props.options.find((option) => option.value === props.modelValue)
)
</script>

<template>
  <SharedDropdown
    position="bottom-left"
    :placement="placement"
    :distance="0"
    class="flex"
    :class="wrapperClass"
  >
    <template #default="{ isOpen }">
      <div class="tab-label px-2 lg:px-4 flex w-full">
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
  </SharedDropdown>
</template>
