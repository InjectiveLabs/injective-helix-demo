<script setup lang="ts">
import { GridStrategyTabs } from '@/types'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const view = useVModel(props, 'modelValue', emit)
</script>

<template>
  <div class="h-header border-b flex">
    <AppButtonSelect
      v-for="value in Object.values(GridStrategyTabs)"
      :key="value"
      v-model="view"
      v-bind="{ value }"
      class="flex items-center px-4 tab-field"
      active-classes="!text-white"
    >
      {{ $t(`sgt.${value}`) }}
    </AppButtonSelect>
  </div>
</template>
