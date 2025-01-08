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
  <div class="space-x-5 rounded-md flex overflow-hidden">
    <AppButtonSelect
      v-for="percentage in [25, 50, 75, 100]"
      :key="percentage"
      class="text-xs leading-none px-1 py-1.5 text-coolGray-450 hover:bg-brand-875 hover:text-white"
      v-bind="{ value: String(percentage), modelValue: '' }"
      :data-cy="`${dataCyTag(CommonCyTags.PercentageAmount)}-${percentage}`"
      @update:model-value="setPercentage"
    >
      {{ percentage }}%
    </AppButtonSelect>
  </div>
</template>
