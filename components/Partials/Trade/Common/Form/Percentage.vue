<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { CommonCyTags } from '@/types'

const emit = defineEmits<{
  'percentage:change': [number: number]
}>()

function setPercentage(percentage: string) {
  emit('percentage:change', Number(percentage))
}
</script>

<template>
  <div class="flex gap-4">
    <AppButtonSelect
      v-for="percentage in [25, 50, 75, 100]"
      :key="percentage"
      v-bind="{ value: String(percentage), modelValue: '' }"
      :data-cy="`${dataCyTag(CommonCyTags.PercentageAmount)}-${percentage}`"
      class="border rounded-md text-xs flex-1 leading-none px-1 py-1.5 text-coolGray-450 hover:bg-brand-875 hover:text-white active:bg-blue-500/20 active:border-blue-500/20 transition-colors duration-200"
      @update:model-value="setPercentage"
    >
      {{ percentage }}%
    </AppButtonSelect>
  </div>
</template>
