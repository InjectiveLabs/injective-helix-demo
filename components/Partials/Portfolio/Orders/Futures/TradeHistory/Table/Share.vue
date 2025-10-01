<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import type { SharedUiDerivativeTrade } from '@shared/types'

const props = withDefaults(
  defineProps<{
    trade: SharedUiDerivativeTrade
  }>(),
  {}
)

const emit = defineEmits<{
  'trade:share': [trade: SharedUiDerivativeTrade]
}>()

function shareTrade() {
  emit('trade:share', props.trade)
}
</script>

<template>
  <UIcon
    :name="NuxtUiIcons.Share"
    class="text-coolGray-500 hover:text-coolGray-400 size-4 min-w-4"
    @click="shareTrade"
  />
</template>
