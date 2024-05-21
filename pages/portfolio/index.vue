<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

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

const { valueToString } = useSharedBigNumberFormatter(
  computed(
    () =>
      leaderboardStore.historicalBalance[
        leaderboardStore.historicalBalance.length - 1
      ].value
  )
)

const { valueToString: percentageToString } = useSharedBigNumberFormatter(
  computed(() => {
    const lastValue =
      leaderboardStore.historicalBalance[
        leaderboardStore.historicalBalance.length - 1
      ].value
    const firstValue = leaderboardStore.historicalBalance[0].value

    return (lastValue / firstValue) * 100
  })
)
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
        <div v-for="i in 3" :key="i" class="border border-brand-800 p-4">
          <div class="space-y-2">
            <p class="text-gray-400">{{ $t('portfolio.value') }}</p>
            <h3 class="text-2xl font-semibold">
              {{ valueToString }}
              $
            </h3>
            <p class="text-green-500">{{ percentageToString }}%</p>
          </div>
          <PartialsPortfolioPortfolioRandomChart />
        </div>
      </div>
    </AppHocLoading>
  </div>
</template>
