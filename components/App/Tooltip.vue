<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

withDefaults(
  defineProps<{
    isLg?: boolean
    content?: string
    isWarning?: boolean
    contentClass?: string
    isDisabled?: boolean
  }>(),
  {
    isLg: false,
    content: '',
    isWarning: false,
    contentClass: '',
    isDisabled: false
  }
)
</script>

<template>
  <UTooltip
    :prevent="isDisabled"
    :text="content"
    :ui="{
      popper: {
        placement: 'top'
      }
    }"
  >
    <slot>
      <UIcon
        :name="NuxtUiIcons.Info"
        :class="{
          'w-4 h-4 min-w-4': isLg,
          'w-3 h-3 min-w-3': !isLg,
          'text-coolGray-500': !isWarning,
          'text-orange-200': isWarning
        }"
      />
    </slot>
  </UTooltip>
</template>
