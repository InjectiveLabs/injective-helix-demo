<script setup lang="ts">
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { BotType } from '@/types'
import type { TradingStrategy } from '@injectivelabs/sdk-ts'

enum ShowcaseTab {
  All = 'All',
  Spot = 'Spot',
  Futures = 'Futures',
  Liquidity = 'Liquidity'
}

const gridStrategyStore = useGridStrategyStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { subaccountPortfolioBalanceMap } = useBalance()

const selectedTab = ref(ShowcaseTab.All)
const status = reactive(new Status(StatusType.Loading))
const strategies = ref<TradingStrategy[]>([])

const { formattedStrategies: spotFormattedStrategies } = useSpotGridStrategies(
  computed(() => strategies.value),
  subaccountPortfolioBalanceMap
)

const { formattedStrategies: derivativeFormattedStrategies } =
  useDerivativeGridStrategies(
    computed(() => strategies.value),
    subaccountPortfolioBalanceMap
  )

const formattedStrategies = computed(() => [
  ...spotFormattedStrategies.value,
  ...derivativeFormattedStrategies.value
])

const items = computed(() => [
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
    label: t('tradingBots.volumeBoost'),
    value: ShowcaseTab.Liquidity
  }
])

const activeTab = computed({
  get: () => items.value.findIndex((item) => item.value === selectedTab.value),
  set: (value) => {
    selectedTab.value = items.value[value].value
  }
})

const filteredStrategies = computed(() =>
  formattedStrategies.value
    .filter((strategy) => {
      if (new BigNumberInBase(strategy.strategy.pnlPerc).lte(0)) {
        return false
      }

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
    .sort((a, b) =>
      new BigNumberInBase(b.strategy.pnlPerc).comparedTo(a.strategy.pnlPerc)
    )
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

    <p class="text-sm text-zinc-500 mb-4 max-w-3xl">
      {{ $t('tradingBots.topPerformersDescription') }}
    </p>

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
