<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'

withDefaults(
  defineProps<{
    cyTag: string
    forceOpen?: boolean
  }>(),
  {}
)

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div>
    <div
      class="flex justify-between items-center cursor-pointer"
      :data-cy="dataCyTag(cyTag)"
      @click="toggle"
    >
      <p class="text-xs font-semibold select-none text-white">
        {{ $t('trade.advancedSettings') }}
      </p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <UIcon :name="NuxtUiIcons.ChevronDown" class="h-3 w-3 min-w-3" />
      </div>
    </div>

    <AppCollapse
      v-bind="{
        isOpen: forceOpen ? true : isOpen
      }"
    >
      <div class="space-y-2 py-2">
        <slot />
      </div>
    </AppCollapse>
  </div>
</template>
