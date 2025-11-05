<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'

const appStore = useAppStore()

const isOpen = ref(true)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div>
    <div
      class="flex items-center justify-between cursor-pointer select-none text-white"
      @click="toggle"
    >
      <p class="text-xs font-semibold select-none">{{ $t('trade.details') }}</p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <UIcon :name="NuxtUiIcons.ChevronDown" class="h-3 w-3 min-w-3" />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="py-4 space-y-2">
        <slot />
      </div>

      <div
        v-if="appStore.devMode && $slots.devMode"
        class="pt-2 pb-4 space-y-1.5 text-white"
      >
        <slot name="devMode" />
      </div>
    </AppCollapse>

    <ModalsSpotSlippage />
    <ModalsFuturesSlippage />
  </div>
</template>
