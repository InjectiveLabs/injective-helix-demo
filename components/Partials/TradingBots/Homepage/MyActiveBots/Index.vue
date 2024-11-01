<script setup lang="ts">
enum ActiveTab {
  All = 'all',
  SpotGrid = 'spot-grid',
  FuturesGrid = 'futures-grid',
  LiquidityGrid = 'liquidity-grid'
}

const { t } = useLang()
const selected = ref(ActiveTab.SpotGrid)

const items = computed(() => [
  {
    label: t('tradingBots.all'),
    value: ActiveTab.All
  },
  {
    label: `${t('tradingBots.spotGrid')} (1)`,
    value: ActiveTab.SpotGrid
  },
  {
    label: `${t('tradingBots.futuresGrid')} (1)`,
    value: ActiveTab.FuturesGrid
  },
  {
    label: `${t('tradingBots.liquidityGrid')} (2)`,
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
        <h3 class="text-xl font-semibold mb-4">
          {{ t('tradingBots.activeBots') }} (2)
        </h3>
        <p class="text-xs text-zinc-500">{{ $t('tradingBots.totalAssets') }}</p>
        <p class="text-xl font-bold">$300,232.32</p>
        <p class="text-xs text-zinc-500">{{ $t('tradingBots.totalPnl') }}</p>
        <p class="text-xl font-bold">
          <span class="text-green-500">+123.43%</span>
        </p>
      </div>

      <div class="flex-1 lg:pl-8">
        <UTabs v-model="value" :items="items" />
        <div class="border-t border-gray-700 -mt-2.5" />

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
