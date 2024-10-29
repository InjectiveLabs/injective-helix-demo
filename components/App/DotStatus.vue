<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

withDefaults(
  defineProps<{
    color?: string
    isActive?: boolean
  }>(),
  {
    color: '',
    isActive: false
  }
)
</script>

<template>
  <div class="flex items-center gap-1 capitalize">
    <UIcon
      :name="NuxtUiIcons.Circle"
      :class="[
        isActive && !color ? 'text-green-500' : 'text-coolGray-500',
        color
      ]"
      class="h-2 w-2 min-w-2"
    />
    <span class="text-sm">
      <slot>
        {{ $t(`common.${isActive ? 'active' : 'inactive'}`) }}
      </slot>
    </span>
  </div>
</template>
