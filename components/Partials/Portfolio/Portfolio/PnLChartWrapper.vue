<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const appStore = useAppStore()
const leaderboardStore = useLeaderboardStore()
const isMobile = useIsMobile()

const status = reactive(new Status(StatusType.Loading))
const { $onError } = useNuxtApp()

onMounted(() => {
  status.setLoading()

  leaderboardStore
    .fetchHistoricalPnl()
    .catch($onError)
    .finally(() => status.setIdle())
})

const pnlSeries = computed(() =>
  leaderboardStore.historicalVolume.map((item) => [item.time, item.value])
)

const { valueToBigNumber: pnlToBigNumber } = useSharedBigNumberFormatter(
  computed(() => pnlSeries.value[pnlSeries.value.length - 1][1])
)
</script>

<template>
  <div class="border p-4">
    <p class="text-gray-400">
      {{ $t(`portfolio.home.volume.title`) }}
    </p>

    <div class="flex space-x-2 items-center">
      <div class="flex items-center space-x-2">
        <span class="lg:text-2xl">$</span>
        <CommonSkeletonSubaccountAmount>
          <CommonNumberCounter
            v-bind="{ value: pnlToBigNumber.toNumber() }"
            :size="isMobile ? 16 : 24"
          />
        </CommonSkeletonSubaccountAmount>
      </div>

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

    <div
      v-if="status.isLoading()"
      class="h-[350px] mt-4 bg-brand-850 rounded-lg animate-pulse"
    />

    <PartialsPortfolioPortfolioAreaChart
      v-else
      v-bind="{ series: pnlSeries }"
    />
  </div>
</template>
