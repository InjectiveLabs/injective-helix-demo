<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'

enum ShowcaseTab {
  All = 'All',
  Spot = 'Spot',
  Futures = 'Futures',
  Liquidity = 'Liquidity'
}

const gridStrategyStore = useGridStrategyStore()
const { t } = useLang()

const status = reactive(new Status(StatusType.Loading))
const strategies = ref<TradingStrategy[]>([])
const { $onError } = useNuxtApp()

const formattedStrategies = useSpotGridStrategies(
  computed(() => strategies.value)
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
    label: t('tradingBots.liquidityGrid'),
    value: ShowcaseTab.Liquidity
  }
]
</script>

<template>
  <div>
    <h3 class="font-bold text-2xl mb-4 space-x-2">
      <span>
        {{ $t('tradingBots.title') }} {{ $t('tradingBots.showcase') }}
      </span>
    </h3>

    <UTabs :items="items" :ui="{ list: { width: 'w-auto' } }" />

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
      <PartialsTradingBotsHomepageShowcaseCard
        v-for="strategy in formattedStrategies"
        :key="strategy.marketId"
        :strategy="strategy"
      />
    </div>
  </div>
</template>
