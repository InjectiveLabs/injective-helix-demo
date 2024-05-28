<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

definePageMeta({
  middleware: ['connected']
})

defineProps({
  portfolioStatus: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Loading)
  }
})
</script>

<template>
  <div class="lg:flex">
    <div
      class="basis-[300px] shrink-0 min-h-[calc(100vh-54px)] border-r border-brand-800 max-lg:hidden"
    >
      <div class="sticky top-0">
        <LayoutNavbarPortfolioMenu />
      </div>
    </div>

    <div class="flex-1 relative basis-[w-full] lg:overflow-x-auto">
      <NuxtPage />
    </div>
  </div>
</template>
