<script setup lang="ts">
import { PortfolioSubPage } from '@/types'
</script>

<template>
  <div>
    <div class="flex items-center p-4">
      <NuxtLink :to="{ name: PortfolioSubPage.Settings }" class="pr-4">
        <SharedIcon name="chevron" />
      </NuxtLink>

      <h3 class="portfolio-title">
        {{ $t('portfolio.settings.preferences.title') }}
      </h3>
    </div>

    <div class="border-y divide-y">
      <PartialsPortfolioSettingsPreferencesThousandsSeparator />
    </div>
  </div>
</template>
