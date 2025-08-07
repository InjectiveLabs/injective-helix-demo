<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import {
  trackChangeSelectedLanguage,
  trackInitialSelectedLanguage
} from '@/app/providers/mixpanel/EventTracker'

const route = useRoute()
const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()
const { locales, setLocale, localeCodes } = useLang()

function onUpdateLocale(selectedLocale: string) {
  setLocale(selectedLocale as (typeof localeCodes.value)[number])

  appStore.setSelectedLanguage(selectedLocale)
  trackChangeSelectedLanguage(selectedLocale)
}

function setAppLanguage() {
  const userDefaultLanguage = navigator?.language?.split('-')[0]

  const defaultLanguage =
    localeCodes.value.find((lang) => lang === userDefaultLanguage) ||
    localeCodes.value[0]

  let selectedLanguage = localeCodes.value.find(
    (lang) => lang === appStore.userState.preferences.selectedLanguage
  )

  const prefixLanguage = localeCodes.value.find(
    (lang) => lang === route.query?.lang
  )

  if (prefixLanguage) {
    selectedLanguage = prefixLanguage
  }

  if (selectedLanguage) {
    setLocale(selectedLanguage)
    appStore.setSelectedLanguage(selectedLanguage)
    trackInitialSelectedLanguage(selectedLanguage)
  } else {
    setLocale(defaultLanguage)
    appStore.setSelectedLanguage(defaultLanguage)
    trackInitialSelectedLanguage(defaultLanguage)
  }
}

onMounted(() => {
  setAppLanguage()
})
</script>

<template>
  <UPopover :popper="{ placement: 'bottom-end', offsetDistance: 12 }">
    <UButton
      variant="ghost"
      class="p-0 dark:hover:bg-transparent dark:text-white dark:hover:text-coolGray-400 transition-colors"
      :class="[
        sharedWalletStore.isUserConnected
          ? 'lg:ml-5 max-lg:mx-2'
          : 'ml-5 max-lg:mr-2'
      ]"
    >
      <UIcon :name="NuxtUiIcons.Globe2" class="size-5" />
    </UButton>

    <template #panel="{ close }">
      <ul
        class="min-w-36 max-h-72 overflow-auto p-2 flex flex-col gap-2 bg-brand-900 ring-1 ring-[#1E263C]"
      >
        <LayoutWalletDetailsLanguageSelectorItem
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
