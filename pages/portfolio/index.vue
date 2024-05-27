<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { PortfolioChartType } from '@/types'

const leaderboardStore = useLeaderboardStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  status.setLoading()

  Promise.all([
    leaderboardStore.fetchHistoricalBalance(),
    leaderboardStore.fetchHistoricalPnl(),
    leaderboardStore.fetchHistoricalVolume()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})

const leaderboardHistories = computed(() => [
  {
    type: PortfolioChartType.Balance,
    history: leaderboardStore.historicalBalance
  },
  {
    type: PortfolioChartType.Pnl,
    history: leaderboardStore.historicalPnl
  },
  {
    type: PortfolioChartType.Volume,
    history: leaderboardStore.historicalVolume
  }
])
</script>

<template>
  <div class="p-4">
    <h1 class="portfolio-title">{{ $t('navigation.portfolio') }}</h1>
    <AppHocLoading
      v-bind="{
        status,
        wrapperClass: status.isLoading()
          ? 'min-h-[calc(100vh-108px)] h-full flex items-center justify-center'
          : ''
      }"
    >
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
        <div
          v-for="({ history, type }, index) in leaderboardHistories"
          :key="`${type}-${index}`"
          class="border border-brand-800 p-4"
        >
          <PartialsPortfolioPortfolioChartWrapper
            v-bind="{ leaderboardHistory: history }"
          >
            <template #title>
              <div class="flex items-center space-x-1">
                <p class="text-gray-400">
                  {{ $t(`portfolio.home.${type}.title`) }}
                </p>
                <AppTooltip
                  v-if="type === PortfolioChartType.Pnl"
                  :content="$t(`portfolio.home.${type}.tooltip`)"
                />
              </div>
            </template>
          </PartialsPortfolioPortfolioChartWrapper>
        </div>
      </div>
    </AppHocLoading>
  </div>
</template>
