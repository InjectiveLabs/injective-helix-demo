<script setup lang="ts">
import { PortfolioSubPage } from '@/types'

const linkOptions = [
  {
    label: 'portfolio.settings.authz.grantee',
    to: { name: PortfolioSubPage.SettingsAuthz }
  },
  {
    label: 'portfolio.settings.authz.granter',
    to: { name: PortfolioSubPage.SettingsAuthzGranter }
  }
]
</script>

<template>
  <div class="">
    <div class="p-4">
      <div class="flex items-center">
        <NuxtLink :to="{ name: PortfolioSubPage.Settings }" class="pr-4">
          <SharedIcon name="chevron" />
        </NuxtLink>

        <h3 class="portfolio-title">
          {{ $t('portfolio.settings.authz.title') }}
        </h3>
      </div>

      <div class="mt-8">
        <NuxtLink
          v-for="option in linkOptions"
          :key="option.label"
          :to="option.to"
          class="p-4 text-gray-400 font-medium"
          exact-active-class="text-white"
        >
          {{ $t(option.label) }}
        </NuxtLink>
      </div>
    </div>

    <div class="border-y">
      <NuxtPage />
    </div>
  </div>
</template>
