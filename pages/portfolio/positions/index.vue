<script setup lang="ts">
//
</script>

<template>
  <div>
    <div class="p-4">
      <p class="portfolio-title">{{ $t('activity.positions') }}</p>
      <p class="text-gray-300 mt-8">{{ $t('activity.openPositions') }}</p>
    </div>

    <div class="border-y divide-y">
      <PartialsPortfolioPositions />
    </div>
  </div>
</template>
