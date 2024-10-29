<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { PortfolioSubPage } from '@/types'
</script>

<template>
  <div>
    <div class="flex items-center p-4">
      <NuxtLink
        :to="{ name: PortfolioSubPage.Settings }"
        class="pr-4 flex items-center"
      >
        <UIcon :name="NuxtUiIcons.ChevronLeft" class="h-6 w-6 min-w-6" />
      </NuxtLink>

      <h3 class="portfolio-title">
        {{ $t('portfolio.settings.preferences.title') }}
      </h3>
    </div>

    <div class="border-y divide-y">
      <PartialsPortfolioSettingsPreferencesThousandsSeparator />
      <PartialsPortfolioSettingsPreferencesShowGridTradingSubaccounts />
    </div>
  </div>
</template>
