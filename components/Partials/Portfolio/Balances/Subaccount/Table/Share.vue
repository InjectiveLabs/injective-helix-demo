<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    token: TokenStatic
  }>(),
  {}
)

const emit = defineEmits<{
  'balance:share': [token: TokenStatic]
}>()

function shareBalance() {
  emit('balance:share', props.token)
}
</script>

<template>
  <UIcon
    :name="NuxtUiIcons.Share"
    class="text-coolGray-500 hover:text-coolGray-400 size-4 min-w-4"
    @click="shareBalance"
  />
</template>
