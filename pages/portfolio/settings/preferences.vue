<script setup lang="ts">
//
</script>

<template>
  <div>
    <div class="flex items-center p-4">
      <NuxtLink :to="{ name: 'portfolio-settings' }" class="pr-4">
        <BaseIcon name="chevron" />
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
