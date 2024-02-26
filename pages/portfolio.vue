<script setup lang="ts">
const { y } = useWindowScroll()
</script>

<template>
  <div class="flex">
    <div
      class="basis-[300px] shrink-0 min-h-screen border-r border-brand-800"
      :style="{ paddingTop: `${y}px` }"
    >
      <div class="">
        <LayoutNavbarPortfolioMenu />
      </div>
    </div>

    <div class="overflow-scroll flex-1">
      <NuxtPage />
    </div>
  </div>
</template>
