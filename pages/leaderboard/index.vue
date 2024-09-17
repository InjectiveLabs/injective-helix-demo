<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { UTC_TIMEZONE } from '@shared/utils/constant'
import { LeaderboardDuration } from '@/types'

const leaderboardStore = useLeaderboardStore()
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

  return format(zonedFirstDate, 'MMMM dd, yyyy')
})

const endDateFormatted = computed(() => {
  if (!leaderboardStore.pnlLeaderboard?.lastDate) {
    return ''
  }

  const zonedLastDate = utcToZonedTime(
    leaderboardStore.pnlLeaderboard.lastDate,
    UTC_TIMEZONE
  )

  return format(zonedLastDate, "MMMM dd, yyyy H:mm:ss 'UTC'")
})

onMounted(() => {
  fetchPnlLeaderboard()
})

function fetchPnlLeaderboard() {
  status.setLoading()

  leaderboardStore
    .fetchPnlLeaderboard(selectedDuration.value)
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div>
    <div
      class="flex flex-col md:flex-row mb-6 md:mb-10 items-start justify-between md:items-center max-md:space-y-4"
    >
      <div class="bg-gray-825 rounded-[4px]">
        <AppButtonSelect
          v-for="value in Object.values(LeaderboardDuration)"
          :key="value"
          v-model="selectedDuration"
          v-bind="{ value }"
          class="text-xs md:text-sm p-1 md:p-2 text-white hover:opacity-100"
          :class="{
            'opacity-50': selectedDuration !== value
          }"
          @update:model-value="fetchPnlLeaderboard"
        >
          {{ $t(`leaderboard.pnl.duration.${value}`) }}
        </AppButtonSelect>
      </div>

      <div class="text-xs md:text-sm md:leading-4 text-gray-350">
        {{
          $t('leaderboard.pnl.timePeriod', {
            startDate: startDateFormatted,
            endDate: endDateFormatted
          })
        }}
      </div>
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
