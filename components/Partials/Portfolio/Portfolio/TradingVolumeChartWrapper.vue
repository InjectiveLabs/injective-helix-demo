<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'

const appStore = useAppStore()
const leaderboardStore = useLeaderboardStore()
const isMobile = useIsMobile()

const status = reactive(new Status(StatusType.Loading))
const { $onError } = useNuxtApp()

onMounted(() => {
  status.setLoading()

  leaderboardStore
    .fetchHistoricalVolume()
    .catch($onError)
    .finally(() => status.setIdle())
})

const volumeSeries = computed(() =>
  leaderboardStore.historicalVolume.map((item) => [item.time, item.value])
)

const { valueToBigNumber: historyToBigNumber } = useSharedBigNumberFormatter(
  computed(() => {
    const lastPrice = volumeSeries.value[volumeSeries.value.length - 1]

    return lastPrice ? lastPrice[1] : 0
  })
)
</script>

<template>
  <div class="border p-4">
    <p class="text-coolGray-400">
      {{ $t(`portfolio.home.volume.title`) }}
    </p>

    <div class="flex space-x-2 items-center">
      <div class="flex items-center space-x-2">
        <span class="lg:text-2xl">$</span>
        <CommonSkeletonSubaccountAmount>
          <CommonNumberCounter
            v-bind="{ value: historyToBigNumber?.toNumber() || 0 }"
            :size="isMobile ? 16 : 24"
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
          class="w-5 h-5 lg:w-7 lg:h-7 -translate-x-[2px]"
        />
        <UIcon v-else :name="NuxtUiIcons.Eye" class="w-5 h-5 lg:w-7 lg:h-7" />
      </button>
    </div>

    <div
      v-if="status.isLoading()"
      class="h-[350px] mt-4 bg-brand-850 rounded-lg animate-pulse"
    />
    <PartialsPortfolioPortfolioTradingVolumeChart
      v-else
      v-bind="{ volumeSeries }"
    />
  </div>
</template>
