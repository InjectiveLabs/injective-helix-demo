<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

const { locales, setLocale, localeProperties } = useI18n()

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function onUpdateLocale(selectedLocale: string) {
  setLocale(selectedLocale)
}
</script>

<template>
  <UPopover
    :ui="{ rounded: 'rounded-2xl' }"
    :popper="{ placement: 'bottom-start' }"
    @update:open="toggleMenu"
  >
    <UButton
      variant="ghost"
      class="w-full px-4 py-2.5 flex items-center gap-2 uppercase transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/50"
    >
      <UIcon :name="NuxtUiIcons.Globe3" class="size-[18px]" />
      <span>{{ localeProperties.name }}</span>
      <UIcon
        class="size-2.5"
        :name="NuxtUiIcons.ChevronUp2"
        :class="{ 'rotate-180': !isMenuOpen }"
      />
    </UButton>

    <template #panel="{ close }">
      <ul
        class="min-w-36 max-h-72 overflow-auto p-2 flex flex-col gap-2 bg-inj-black ring-1 ring-[#1E263C]"
      >
        <LayoutFooterLocalizationSelectorItem
          v-for="(item, index) in locales"
          :key="index"
          v-bind="{ item }"
          @on:click="close"
          @locale:update="onUpdateLocale"
        />
      </ul>
    </template>
  </UPopover>
</template>
