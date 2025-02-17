<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'

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
      <p class="text-coolGray-400">
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
              class="text-coolGray-500 flex justify-center cursor-pointer"
              @click="appStore.toggleHideBalances"
            >
              <UIcon
                v-if="appStore.userState.preferences.isHideBalances"
                :name="NuxtUiIcons.EyeSlash"
                class="w-5 h-5 lg:w-7 lg:h-7 -translate-x-[2px]"
              />
              <UIcon
                v-else
                :name="NuxtUiIcons.Eye"
                class="w-5 h-5 lg:w-7 lg:h-7"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="status.isLoading()"
      class="h-[350px] mt-4 bg-brand-850 rounded-lg animate-pulse"
    />

    <PartialsPortfolioPortfolioAreaChart
      v-else
      v-bind="{
        series: pnlSeries,
        isProfit,
        label: 'common.pnl'
      }"
    />
  </div>
</template>
