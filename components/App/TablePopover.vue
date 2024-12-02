<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
</script>

<template>
  <UPopover>
    <UButton
      :icon="NuxtUiIcons.MenuDots"
      size="sm"
      color="black"
      :ui="{
        rounded: 'rounded-sm',
        square: {
          sm: 'px-2 py-1'
        },
        color: {
          black: {
            solid: 'dark:bg-brand-875 dark:hover:bg-brand-800 dark:text-white'
          }
        },
        icon: {
          size: {
            sm: 'h-4 w-4'
          }
        }
      }"
    />

    <template #panel>
      <slot />
    </template>
  </UPopover>
</template>
