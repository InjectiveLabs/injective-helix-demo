<script setup lang="ts">
const { t } = useLang()

enum ShowcaseTab {
  All = 'All',
  Spot = 'Spot',
  Futures = 'Futures',
  Liquidity = 'Liquidity'
}

const items = [
  {
    label: t('tradingBots.all'),
    value: ShowcaseTab.All
  },
  {
    label: t('tradingBots.spotGrid'),
    value: ShowcaseTab.Spot
  },
  {
    label: t('tradingBots.futuresGrid'),
    value: ShowcaseTab.Futures
  },
  {
    label: t('tradingBots.liquidityGrid'),
    value: ShowcaseTab.Liquidity
  }
]
</script>

<template>
  <div>
    <h3 class="font-bold text-2xl mb-4 space-x-2">
      <span class="rounded-md bg-yellow-500 px-2 py-1 text-black">
        {{ $t('tradingBots.title') }}
      </span>
      <span>{{ $t('tradingBots.showcase') }}</span>
    </h3>

    <UTabs :items="items" :ui="{ list: { width: 'w-auto' } }" />

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
      <PartialsTradingBotsHomepageShowcaseCard v-for="i in 3" :key="i" />
    </div>
  </div>
</template>
