<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { UTC_TIMEZONE } from '@shared/utils/constant'
import { LeaderboardDuration } from '@/types'

const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const selectedDuration = ref(LeaderboardDuration.All)

const startDateFormatted = computed(() => {
  if (!leaderboardStore.pnlLeaderboard?.firstDate) {
    return ''
  }

  const zonedFirstDate = utcToZonedTime(
    leaderboardStore.pnlLeaderboard.firstDate,
    UTC_TIMEZONE
  )

  return format(zonedFirstDate, "MMMM dd, H:mm 'UTC'")
})

const endDateFormatted = computed(() => {
  if (!leaderboardStore.pnlLeaderboard?.lastDate) {
    return ''
  }

  const zonedLastDate = utcToZonedTime(
    leaderboardStore.pnlLeaderboard.lastDate,
    UTC_TIMEZONE
  )

  if (selectedDuration.value === LeaderboardDuration.OneDay) {
    return format(zonedLastDate, "H:mm 'UTC'")
  }

  return format(zonedLastDate, "MMMM dd, H:mm 'UTC'")
})

onWalletConnected(() => {
  fetchPnlLeaderboard()
})

function fetchPnlLeaderboard() {
  status.setLoading()

  leaderboardStore
    .fetchPnlLeaderboard(
      selectedDuration.value,
      sharedWalletStore.injectiveAddress
    )
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div>
    <div
      class="flex flex-col md:flex-row mb-6 md:mb-10 items-start justify-between md:items-center max-md:space-y-4"
    >
      <div class="bg-coolGray-825 rounded-[4px]">
        <AppButtonSelect
          v-for="value in Object.values(LeaderboardDuration)"
          :key="value"
          v-model="selectedDuration"
          v-bind="{ value }"
          class="text-xs md:text-sm p-1 md:p-2 text-white opacity-50 hover:opacity-100 cursor-pointer"
          active-classes="!opacity-100"
          @update:model-value="fetchPnlLeaderboard"
        >
          {{ $t(`leaderboard.pnl.duration.${value}`) }}
        </AppButtonSelect>
      </div>

      <CommonHeaderTooltip
        v-if="status.isIdle()"
        :tooltip="
          $t(
            `leaderboard.${
              selectedDuration === LeaderboardDuration.All
                ? 'pnl.allTime'
                : 'refresh'
            }`
          )
        "
        class="text-xs md:text-sm md:leading-4 text-coolGray-350 border-b cursor-pointer border-dashed border-coolGray-350"
        is-not-styled
      >
        {{
          selectedDuration !== LeaderboardDuration.All
            ? $t('leaderboard.pnl.timePeriod', {
                startDate: startDateFormatted,
                endDate: endDateFormatted
              })
            : $t('leaderboard.pnl.lastUpdated', {
                lastUpdatedDate: endDateFormatted
              })
        }}
      </CommonHeaderTooltip>
    </div>

    <AppHocLoading v-bind="{ status }">
      <div class="overflow-x-auto">
        <div class="w-full text-sm relative">
          <PartialsLeaderboardPnlMyStats v-bind="{ selectedDuration }" />

          <PartialsLeaderboardPnlTable />
        </div>
      </div>
    </AppHocLoading>
  </div>
</template>

<style>
.pnl-table {
  @apply grid grid-cols-5 md:grid-cols-7 relative;

  > :nth-child(1) {
    @apply pl-3 md:pl-7 text-left col-span-1;
  }

  > :nth-child(2) {
    @apply text-left col-span-2 md:col-span-4;
  }

  > :nth-child(3) {
    @apply text-right md:text-left col-span-2 mr-0.5;
  }
}
</style>
