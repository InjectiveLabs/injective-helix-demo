<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { BotType } from '~/types'

enum ShowcaseTab {
  All = 'All',
  Spot = 'Spot',
  Futures = 'Futures',
  Liquidity = 'Liquidity'
}

const gridStrategyStore = useGridStrategyStore()
const { t } = useLang()

const selectedTab = ref(ShowcaseTab.Spot)
const status = reactive(new Status(StatusType.Loading))
const strategies = ref<TradingStrategy[]>([])
const { $onError } = useNuxtApp()

const { formattedStrategies } = useSpotGridStrategies(
  computed(() => strategies.value)
)

const items = [
  {
    label: t('tradingBots.all'),
    value: ShowcaseTab.All
  },
  {
    label: t('tradingBots.spotGrid'),
    value: ShowcaseTab.Spot
  },
  // {
  //   label: t('tradingBots.futuresGrid'),
  //   value: ShowcaseTab.Futures
  // },
  {
    label: t('tradingBots.volumeBoost'),
    value: ShowcaseTab.Liquidity
  }
]

const activeTab = computed({
  get: () => items.findIndex((item) => item.value === selectedTab.value),
  set: (value) => {
    selectedTab.value = items[value].value
  }
})

const filteredStrategies = computed(() =>
  formattedStrategies.value.filter((strategy) => {
    if (selectedTab.value === ShowcaseTab.All) {
      return true
    }

    if (selectedTab.value === ShowcaseTab.Spot) {
      return strategy.botType === BotType.SpotGrid
    }

    if (selectedTab.value === ShowcaseTab.Liquidity) {
      return strategy.botType === BotType.LiquidityGrid
    }

    if (selectedTab.value === ShowcaseTab.Futures) {
      return strategy.botType === BotType.FuturesGrid
    }

    return false
  })
)

onMounted(() => {
  status.setLoading()

  Promise.all([gridStrategyStore.fetchStrategyWithPnl()])
    .then(([tradingStrategies]) => {
      strategies.value = tradingStrategies
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <div class="pb-10 min-h-[500px]">
    <h3 class="font-bold text-2xl mb-4 space-x-2">
      <span>
        {{ $t('tradingBots.topPerformers') }}
      </span>
    </h3>

    <UTabs
      v-model="activeTab"
      :items="items"
      :ui="{ list: { width: 'w-auto' } }"
    />

    <UCard v-if="filteredStrategies.length === 0" class="mt-6">
      <div class="flex justify-center items-center py-10">
        <p class="text-sm text-zinc-500">
          {{ t('tradingBots.noActiveBots') }}
        </p>
      </div>
    </UCard>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
      <PartialsTradingBotsHomepageShowcaseCard
        v-for="strategy in filteredStrategies"
        :key="strategy.marketId"
        :strategy="strategy"
      />
    </div>
  </div>
</template>
