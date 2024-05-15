<script setup lang="ts">
//
</script>

<template>
  <div class="container py-10">
    <h2 class="text-2xl font-semibold">{{ $t('leaderboard.title') }}</h2>
    <p class="mt-2">{{ $t('leaderboard.description') }}</p>

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
