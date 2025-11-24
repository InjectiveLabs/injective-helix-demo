<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    position: PositionV2
  }>(),
  {}
)

const emit = defineEmits<{
  'position:share': [position: PositionV2]
}>()

function sharePosition() {
  emit('position:share', props.position)
}
</script>

<template>
  <UIcon
    :name="NuxtUiIcons.Share"
    class="text-coolGray-500 hover:text-coolGray-400 w-4 h-4 min-w-4"
    @click="sharePosition"
  />
</template>
