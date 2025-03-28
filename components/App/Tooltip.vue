<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

withDefaults(
  defineProps<{
    ui?: object
    icon?: string
    isLg?: boolean
    content?: string
    isWarning?: boolean
    isDisabled?: boolean
    contentClass?: string
  }>(),
  {
    isLg: false,
    content: '',
    ui: () => ({}),
    isWarning: false,
    contentClass: '',
    isDisabled: false,
    icon: NuxtUiIcons.Info
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
      },
      ...ui
    }"
  >
    <slot>
      <UIcon
        :name="icon || NuxtUiIcons.Info"
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
