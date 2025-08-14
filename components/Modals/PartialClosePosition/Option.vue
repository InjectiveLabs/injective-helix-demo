<script lang="ts" setup>
import { PerpetualMarketCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
  }>(),
  {}
)

const emit = defineEmits<{
  'option:update': [percentage: number]
}>()

const selectOption = () => {
  emit('option:update', props.value)
}
</script>

<template>
  <span
    class="font-mono text-coolGray-450 cursor-pointer hover:text-coolGray-200 transition-colors"
    @click="selectOption"
    :data-cy="`${dataCyTag(PerpetualMarketCyTags.PartialClosePositionOption)}-${label}`"
  >
    {{ label }}
  </span>
</template>
