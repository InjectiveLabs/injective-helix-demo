<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

const props = withDefaults(
  defineProps<{
    limit: number
    options: number[]
    selectedClass?: string
  }>(),
  {
    options: () => [],
    selectedClass: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [state: number]
}>()

const formattedOptions = computed(() =>
  props.options.map((num) => {
    return {
      label: `${num}`,
      id: num
    }
  })
)

const selectedOption = computed(() =>
  props.options.find((option) => option === props.limit)
)

function onLimitChange(limit: any) {
  emit('update:modelValue', limit)
}
</script>

<template>
  <USelectMenu
    :options="formattedOptions"
    value-attribute="id"
    :popper="{ placement: 'top-end' }"
    @update:model-value="onLimitChange"
  >
    <div
      class="flex items-center gap-2"
      :classes="selectedClass || 'border border-coolGray-400 py-2 px-3'"
    >
      <span v-if="selectedOption" class="font-semibold text-white text-[15px]">
        {{ selectedOption }}
      </span>
      <UIcon :name="NuxtUiIcons.ChevronUp" class="h-4 w-4" />
    </div>
  </USelectMenu>
</template>
