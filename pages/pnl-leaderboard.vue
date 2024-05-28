<script setup lang="ts">
import { MainPage } from '@/types'

// todo: remove this when pnl goes live
definePageMeta({
  middleware: () => {
    return navigateTo({ name: MainPage.Index })
  }
})
</script>

<template>
  <div class="container py-10">
    <h2 class="text-2xl font-semibold">{{ $t('leaderboard.title') }}</h2>
    <div class="flex items-center justify-center space-x-1 mt-2">
      <p>{{ $t('leaderboard.description') }}</p>
      <AppTooltip
        v-bind="{
          content: $t('leaderboard.tooltip')
        }"
      />
    </div>

    <div class="mt-4">
      <PartialsLeaderboardTableHeader />
      <div class="divide-y">
        <PartialsLeaderboardRow v-for="i in 10" :key="i" />
      </div>
    </div>

    <AppPagination
      class="mt-10"
      v-bind="{ totalCount: 100, limit: 10, page: 1 }"
    />
  </div>
</template>
