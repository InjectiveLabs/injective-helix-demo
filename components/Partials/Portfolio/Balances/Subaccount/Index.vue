<script setup lang="ts">
const search = ref('')
const showUnverifiedAssets = ref(false)
</script>

<template>
  <div class="border-y divide-y">
    <PartialsPortfolioBalancesSubaccountTabs
      v-model:search="search"
      v-model:show-unverified-assets="showUnverifiedAssets"
    />

    <div class="overflow-x-auto">
      <div class="lg:min-w-[1100px] divide-y border-b">
        <PartialsPortfolioBalancesSubaccountTable
          v-bind="{ search, showUnverifiedAssets }"
        />
      </div>
    </div>
  </div>
</template>
