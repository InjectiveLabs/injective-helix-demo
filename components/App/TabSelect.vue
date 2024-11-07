<script setup lang="ts">
import { SharedDropdownOption, NuxtUiIcons } from '@shared/types'

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
  <UPopover
    :popper="{ placement: 'bottom-start', offsetDistance: 0 }"
    class="flex"
    :class="wrapperClass"
  >
    <template #default="{ open }">
      <div class="tab-label px-2 lg:px-4 flex w-full">
        <slot v-bind="{ isOpen: open, selected }" />
        <div class="flex items-center pl-2">
          <div class="transition-all" :class="{ 'rotate-180': open }">
            <UIcon class="h-3 w-3 min-w-3" :name="NuxtUiIcons.ChevronDown" />
          </div>
        </div>
      </div>
    </template>

    <template #panel="{ close }">
      <div class="divide-y">
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
  </UPopover>
</template>
