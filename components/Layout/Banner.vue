<script lang="ts" setup>
import { getBridgeUrl } from '@shared/utils/network'
</script>

<template>
  <div
    class="bg-blue-400 text-blue-900 flex items-center justify-center px-3 py-2 text-sm"
  >
    <NuxtLink :to="getBridgeUrl()" target="_blank" class="hover:text-white">
      <div class="flex items-center space-x-2">
        <p>{{ $t('globalBanner.title') }}</p>

        <SharedIcon name="arrow" class="rotate rotate-180" is-md />
      </div>
    </NuxtLink>
  </div>
</template>
