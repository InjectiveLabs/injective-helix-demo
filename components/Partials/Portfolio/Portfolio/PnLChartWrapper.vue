<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const isMobile = useIsMobile()
const appStore = useAppStore()
const leaderboardStore = useLeaderboardStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  status.setLoading()

  leaderboardStore
    .fetchHistoricalPnl()
    .catch($onError)
    .finally(() => status.setIdle())
})

const pnlSeries = computed(() =>
  leaderboardStore.historicalPnl.map((item) => [item.time, item.value])
)

const { valueToBigNumber: pnlToBigNumber } = useSharedBigNumberFormatter(
  computed(() => {
    const lastValue = pnlSeries.value[pnlSeries.value.length - 1]

    return lastValue ? lastValue[1] : 0
  })
)

const percentageChange = computed(() => {
  const lastValue = pnlSeries.value[pnlSeries.value.length - 1]
  const firstValue = pnlSeries.value[0]

  if (!lastValue || !firstValue) {
    return 0
  }

  return 100 - (firstValue[1] / lastValue[1]) * 100
})

const isProfit = computed(() => {
  return (
    leaderboardStore.historicalPnl[leaderboardStore.historicalPnl.length - 1]
      ?.value > 0
  )
})
</script>

<template>
  <div class="border p-4">
    <div class="flex items-center space-x-2">
      <p class="text-gray-400">
        {{ $t(`portfolio.home.pnl.title`) }}
      </p>
      <AppTooltip :content="$t(`portfolio.home.pnl.tooltip`)" />
    </div>

    <div class="h-14">
      <div class="flex-1">
        <div>
          <div class="flex items-center space-x-2">
            <span class="lg:text-2xl">$</span>
            <CommonSkeletonSubaccountAmount>
              <CommonNumberCounter
                v-bind="{ value: pnlToBigNumber?.toNumber() || 0 }"
                :size="isMobile ? 16 : 24"
              />
            </CommonSkeletonSubaccountAmount>

            <button
              class="text-gray-500 flex justify-center cursor-pointer"
              @click="appStore.toggleHideBalances"
            >
              <SharedIcon
                v-if="appStore.userState.preferences.isHideBalances"
                name="hide"
                class="w-5 h-3 lg:w-8 lg:h-5 -translate-x-[2px]"
              />

              <SharedIcon v-else name="show" class="w-5 lg:w-7" />
            </button>
          </div>
        </div>
        <p
          :class="{
            'text-red-500': !isProfit,
            'text-green-500': isProfit
          }"
        >
          <span class="text-sm flex items-center space-x-1">
            <CommonNumberCounter
              v-bind="{ value: percentageChange, decimals: 2, size: 15 }"
            />
            <span class="text-sm">%</span>
          </span>
        </p>
      </div>
    </div>

    <div
      v-if="status.isLoading()"
      class="h-[350px] mt-4 bg-brand-850 rounded-lg animate-pulse"
    />

    <PartialsPortfolioPortfolioAreaChart
      v-else
      v-bind="{ series: pnlSeries, isProfit }"
    />
  </div>
</template>
