<script setup lang="ts">
const isAuthzEnabled = ref(false)
</script>

<template>
  <div class="flex p-4">
    <div class="flex items-center p-2">
      <AppSwitch v-model="isAuthzEnabled" />
    </div>

    <div class="text-sm p-2">
      <p class="font-medium">{{ $t('portfolio.settings.authz.title') }}</p>
      <p class="text-gray-400">
        {{ $t('portfolio.settings.authz.description') }}
      </p>
    </div>
  </div>

  <div v-if="isAuthzEnabled">
    <PartialsPortfolioSettingsAuthz />
  </div>
</template>
