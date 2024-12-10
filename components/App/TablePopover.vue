<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
</script>

<template>
  <UPopover>
    <AppButton
      size="xs"
      class="dark:bg-brand-875 dark:hover:bg-brand-800 dark:text-white border-0 rounded-sm"
    >
      <UIcon :name="NuxtUiIcons.MenuDots" class="size-4" />
    </AppButton>

    <template #panel>
      <slot />
    </template>
  </UPopover>
</template>
