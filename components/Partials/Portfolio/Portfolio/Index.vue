<script setup lang="ts">
//
</script>

<template>
  <div class="p-4">
    <h1 class="portfolio-title">Portfolio</h1>
    <div class="grid grid-cols-2 gap-10 mt-6">
      <div v-for="i in 3" :key="i" class="border border-brand-800 p-4">
        <div class="space-y-2">
          <p class="text-gray-400">Portfolio Value</p>
          <h3 class="text-2xl font-semibold">3,322 $</h3>
          <p class="text-green-500">+6.8% ($1423.12)</p>
        </div>

        <PartialsPortfolioPortfolioRandomChart class="w-full" />
      </div>
    </div>
  </div>
</template>
