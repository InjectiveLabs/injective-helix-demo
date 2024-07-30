<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { UTC_TIMEZONE } from '@shared/utils/constant'
import { Modal, BusEvents, LeaderboardType, LeaderboardDuration } from '@/types'

const modalStore = useModalStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const selectedDuration = ref(LeaderboardDuration.All)

const startDateFormatted = computed(() => {
  if (!leaderboardStore.leaderboard?.firstDate) {
    return ''
  }

  const zonedFirstDate = utcToZonedTime(
    leaderboardStore.leaderboard.firstDate,
    UTC_TIMEZONE
  )

  return format(zonedFirstDate, 'MMMM dd, yyyy')
})

const endDateFormatted = computed(() => {
  if (!leaderboardStore.leaderboard?.lastDate) {
    return ''
  }

  const zonedLastDate = utcToZonedTime(
    leaderboardStore.leaderboard.lastDate,
    UTC_TIMEZONE
  )

  return format(zonedLastDate, "MMMM dd, yyyy H:mm:ss 'UTC'")
})

const userStats = computed(() => {
  if (!leaderboardStore.leaderboard?.leaders) {
    return
  }

  return leaderboardStore.leaderboard.leaders.find(
    (leader) => leader.account === sharedWalletStore.address
  )
})

onMounted(() => {
  fetchPnlLeaderboard()
})

function fetchPnlLeaderboard() {
  status.setLoading()

  leaderboardStore
    .fetchLeaderboard({
      type: LeaderboardType.Pnl,
      resolution: selectedDuration.value
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

function onSharePnl() {
  modalStore.openModal(Modal.SharePnl)

  useEventBus(BusEvents.SharePnlOpened).emit()
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
          <PartialsLeaderboardMyStats v-if="userStats" is-pnl>
            <template #add-on>
              <div
                class="flex bg-white bg-opacity-20 items-center gap-1 p-2 rounded-[4px] cursor-pointer relative"
                @click="onSharePnl"
              >
                <SharedIcon name="share2" class="min-w-4 w-4 h-4 -mt-1" />

                <p class="text-[11px] leading-[13px] font-medium">
                  {{ $t('leaderboard.pnl.share') }}
                </p>
              </div>
            </template>

            <template #row>
              <div>
                <div class="hidden md:block">
                  <PartialsLeaderboardPnlMyStatsRow
                    v-bind="{
                      pnl: userStats.pnl,
                      rank: userStats.rank,
                      account: userStats.account
                    }"
                  />
                </div>

                <div class="md:hidden">
                  <PartialsLeaderboardPnlMyStatsMobileRow
                    v-bind="{
                      pnl: userStats.pnl,
                      rank: userStats.rank,
                      account: userStats.account
                    }"
                  />
                </div>
              </div>
            </template>
          </PartialsLeaderboardMyStats>

          <PartialsLeaderboardPnlTable />
        </div>
      </div>
    </AppHocLoading>

    <ModalsSharePnl
      v-if="userStats"
      v-bind="{
        selectedDuration,
        pnl: userStats.pnl,
        rank: userStats.rank
      }"
    />
  </div>
</template>
