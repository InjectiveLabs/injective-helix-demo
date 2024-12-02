<script setup lang="ts">
const { showUnverifiedAssets } = useBalance()

const search = ref('')
</script>

<template>
  <div class="border-y divide-y">
    <PartialsPortfolioBalancesSubaccountTabs
      v-model:search="search"
      v-model:show-unverified-assets="showUnverifiedAssets"
    />

    <div class="overflow-x-auto">
      <div class="lg:min-w-[1100px] divide-y border-b">
        <PartialsPortfolioBalancesSubaccountTable v-bind="{ search }" />
      </div>
    </div>
  </div>
</template>
