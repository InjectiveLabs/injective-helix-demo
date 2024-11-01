<script setup lang="ts">
enum ActiveTab {
  All = 'all',
  SpotGrid = 'spot-grid',
  FuturesGrid = 'futures-grid',
  LiquidityGrid = 'liquidity-grid'
}

const selected = ref(ActiveTab.SpotGrid)

const items = computed(() => [
  {
    label: 'All',
    value: ActiveTab.All
  },
  {
    label: 'Spot Grid (1)',
    value: ActiveTab.SpotGrid
  },
  {
    label: 'Futures Grid (1)',
    value: ActiveTab.FuturesGrid
  },
  {
    label: 'Liquidity Grid (2)',
    value: ActiveTab.LiquidityGrid
  }
])

const value = computed({
  get: () => items.value.findIndex((item) => item.value === selected.value),
  set: (value) => {
    selected.value = items.value[value].value
  }
})
</script>

<template>
  <UCard>
    <div class="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
      <div class="space-y-2">
        <h3 class="text-xl font-semibold mb-4">My Active Bots (2)</h3>
        <p class="text-xs text-zinc-500">Total Assets</p>
        <p class="text-xl font-bold">$300,232.32</p>
        <p class="text-xs text-zinc-500">Total PnL</p>
        <p class="text-xl font-bold">
          <span class="text-green-500">+123.43%</span>
        </p>
      </div>

      <div class="flex-1 lg:pl-8">
        <UTabs v-model="value" :items="items" />

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          <PartialsTradingBotsHomepageMyActiveBotsCard
            v-for="i in 2"
            :key="i"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
