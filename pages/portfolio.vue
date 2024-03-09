<script setup lang="ts">
//
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

    <div class="flex-1">
      <div class="h-[300vh]">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
