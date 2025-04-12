<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { PortfolioSubPage } from '@/types'

const settingsOptions = [
  {
    label: 'portfolio.settings.authz.title',
    description: 'portfolio.settings.authz.description',
    to: { name: PortfolioSubPage.SettingsAuthz }
  },
  {
    label: 'portfolio.settings.preferences.title',
    description: 'portfolio.settings.preferences.description',
    to: { name: PortfolioSubPage.SettingsPreferences }
  },
  {
    label: 'portfolio.settings.autoSign.title',
    description: 'portfolio.settings.autoSign.description',
    to: { name: PortfolioSubPage.SettingsAutosign }
  }
]
</script>

<template>
  <div>
    <div class="p-4">
      <h3 class="portfolio-title">{{ $t('portfolio.settings.title') }}</h3>
    </div>

    <div class="divide-y border-y">
      <NuxtLink
        v-for="link in settingsOptions"
        :key="link.label"
        :to="link.to"
        class="p-4 flex justify-between hover:bg-brand-850"
      >
        <div class="pr-8">
          <h3 class="font-semibold text-sm">{{ $t(link.label) }}</h3>
          <p class="text-xs text-coolGray-500 mt-2">
            {{ $t(link.description) }}
          </p>
        </div>

        <div class="flex items-center p-4">
          <UIcon
            :name="NuxtUiIcons.ChevronLeft"
            class="h-3 w-3 min-w-3 rotate-180"
          />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
