<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'

const props = withDefaults(
  defineProps<{
    status?: Status
    tooltip?: string
    isDisabled?: boolean
  }>(),
  {
    status: () => new Status(),
    tooltip: '',
    isDisabled: false
  }
)

const emit = defineEmits<{
  click: []
}>()

function click() {
  if (props.status.isLoading() || props.isDisabled) {
    return
  }

  emit('click')
}
</script>

<template>
  <AppTooltip :is-disabled="!tooltip" :content="tooltip">
    <UButton
      :disabled="isDisabled"
      :icon="status.isLoading() ? NuxtUiIcons.Loading : NuxtUiIcons.Trash"
      variant="ghost"
      :color="isDisabled || status.isLoading() ? 'gray' : 'red'"
      :ui="{
        rounded: 'rounded-full',
        icon: { size: { sm: 'h-4 w-4' } },
        color: { red: { ghost: 'dark:text-red-500' } }
      }"
      @click="click"
    />
  </AppTooltip>
</template>
