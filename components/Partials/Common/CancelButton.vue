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
    <AppButton
      :disabled="isDisabled"
      :is-loading="status.isLoading()"
      variant="danger-cta"
      class="rounded-full p-1 text-red-500"
      @click="click"
    >
      <UIcon :name="NuxtUiIcons.Trash" class="size-4" />
    </AppButton>
  </AppTooltip>
</template>
