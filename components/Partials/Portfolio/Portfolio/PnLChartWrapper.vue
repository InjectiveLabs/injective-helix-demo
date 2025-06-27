<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { HistoricalPortfolioDuration } from '@/types'

const appStore = useAppStore()
const leaderboardStore = useLeaderboardStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const selectedDuration = ref(HistoricalPortfolioDuration.OneMonth)

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

onMounted(() => fetchPnl())

function fetchPnl() {
  status.setLoading()

  leaderboardStore
    .fetchHistoricalPnl(selectedDuration.value)
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div class="p-6">
    <div
      class="h-40 xs:h-28 gap-2 flex items-start xs:justify-between max-xs:flex-col"
    >
      <div>
        <div class="flex items-center gap-2">
          <p class="text-coolGray-400">
            {{ $t(`portfolio.home.pnl.title`) }}
          </p>
          <AppTooltip :content="$t(`portfolio.home.pnl.tooltip`)" />
        </div>

        <div class="flex items-center gap-2">
          <div class="flex">
            <span class="text-2xl">$</span>
            <CommonSkeletonSubaccountAmount>
              <CommonNumberCounter
                v-bind="{ size: 24, value: pnlToBigNumber?.toNumber() || 0 }"
              />
            </CommonSkeletonSubaccountAmount>
          </div>

          <button
            class="text-coolGray-500 flex justify-center cursor-pointer"
            @click="appStore.toggleHideBalances"
          >
            <UIcon
              v-if="appStore.userState.preferences.isHideBalances"
              :name="NuxtUiIcons.EyeSlash"
              class="size-7 -translate-x-[2px]"
            />
            <UIcon v-else :name="NuxtUiIcons.Eye" class="size-7" />
          </button>
        </div>
      </div>

      <div class="bg-coolGray-800 rounded flex p-1">
        <AppButtonSelect
          v-for="value in Object.values(HistoricalPortfolioDuration)"
          :key="value"
          v-model="selectedDuration"
          v-bind="{ value }"
          active-classes="bg-coolGray-875 !opacity-100"
          class="text-sm py-1 px-3 text-white hover:opacity-50 cursor-pointer rounded transition-opacity"
          @update:model-value="fetchPnl"
        >
          {{ $t(`portfolio.duration.${value}`) }}
        </AppButtonSelect>
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
