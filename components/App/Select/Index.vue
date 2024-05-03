<script lang="ts" setup>
import { BaseDropdownOption } from '@injectivelabs/ui-shared/lib/types'

const props = defineProps({
  isNoMinWidth: Boolean,
  startPlacement: Boolean,

  options: {
    type: Array as PropType<BaseDropdownOption[]>,
    required: true
  },

  modelValue: {
    type: String,
    default: ''
  },

  wrapperClass: {
    type: String,
    default: ''
  },

  contentClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  'update:modelValue': [state: string]
}>()

const uuid = Math.random()

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue)
)

function select(option: BaseDropdownOption) {
  emit('update:modelValue', option.value)
}
</script>

<template>
  <BaseDropdown
    :popper-class="`selector ${!isNoMinWidth && 'min-w-40'}`"
    :placement="startPlacement ? 'bottom-start' : 'bottom-end'"
    :flip="false"
  >
    <template #default="{ isOpen }">
      <div class="flex items-center gap-2" :class="wrapperClass">
        <slot name="prefix" />

        <slot :selected="selectedOption" />

        <slot name="icon" :is-open="isOpen">
          <SharedIcon
            name="chevron-down"
            class="h-3 w-3 min-w-3 fill-current"
            :class="{
              'ease-in-out duration-300': isOpen,
              'rotate-180': isOpen,
              'rotate-0': !isOpen
            }"
          />
        </slot>
      </div>
    </template>

    <template #content="{ close }">
      <div
        class="bg-brand-900 border border-brand-800 rounded-lg p-2 flex flex-col"
        :class="contentClass"
      >
        <div
          v-for="(option, index) in options"
          :key="`${uuid}-selector-${index}`"
          class="flex items-center px-2 py-1 cursor-pointer rounded"
          :class="[
            option.value === modelValue
              ? 'text-blue-500 hover:text-blue-900 hover:bg-blue-500'
              : 'text-white hover:bg-blue-500 hover:text-blue-900'
          ]"
          @click="
            () => {
              select(option)
              close()
            }
          "
        >
          <slot name="option" :option="option" />
        </div>
      </div>
    </template>
  </BaseDropdown>
</template>
