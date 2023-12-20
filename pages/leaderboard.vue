<script lang="ts" setup>
import { format } from 'date-fns'
import { Status, StatusType } from '@injectivelabs/utils'

const leaderboardStore = useLeaderboardStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const FilterList = {
  Overall: 'overall',
  Volume: 'volume',
  ROI: 'roi',
  PnL: 'pnl',
  Competition: 'competition'
}

const SelectList = {
  Day: '1d',
  Week: '7d'
}

const resolutionOptions = [
  {
    display: t('leaderboard.resolutionOptions.daily'),
    value: SelectList.Day
  },
  {
    display: t('leaderboard.resolutionOptions.weekly'),
    value: SelectList.Week
  }
]

const activeTab = ref(FilterList.Overall)
const resolution = ref(SelectList.Day)
const status = reactive(new Status(StatusType.Loading))

const formattedLastUpdatedAt = computed(() => {
  const timestamp = new Date(0)

  timestamp.setUTCSeconds(leaderboardStore.lastUpdatedAt)

  return format(timestamp, 'yyyy-MM-dd HH:mm:ss')
})

onMounted(() => {
  Promise.all([leaderboardStore.init()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

function fetchLeaderboard() {
  status.setLoading()

  return leaderboardStore
    .fetchLeaderboard(resolution.value)
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div class="h-full w-full flex flex-wrap py-14">
    <div class="container xl:max-w-6xl">
      <div class="flex justify-between mb-10">
        <div class="flex flex-col">
          <span class="text-3xl font-bold mb-2">
            {{ $t('leaderboard.title') }}
          </span>
          <span class="text-lg">
            {{ $t('leaderboard.description') }}
          </span>
        </div>
        <div>
          <img class="w-full" src="/svg/leaderboard.svg" alt="leaderboard" />
        </div>
      </div>

      <CommonTabMenu>
        <AppSelectButton
          v-for="filterType in Object.values(FilterList)"
          :key="`leaderboard-tabs-${filterType}`"
          v-model="activeTab"
          :value="filterType"
        >
          <template #default="{ isActive }">
            <CommonTabMenuItem :is-active="isActive">
              <span v-if="filterType === FilterList.Overall">
                {{ $t('leaderboard.tabs.overall') }}
              </span>
              <span v-else-if="filterType === FilterList.Volume">
                {{ $t('leaderboard.tabs.volume') }}
              </span>
              <span v-else-if="filterType === FilterList.ROI">
                {{ $t('leaderboard.tabs.roi') }}
              </span>
              <span v-else-if="filterType === FilterList.PnL">
                {{ $t('leaderboard.tabs.pnl') }}
              </span>
              <span v-else-if="filterType === FilterList.Competition">
                {{ $t('leaderboard.tabs.summerTradingCompetition') }}
              </span>
            </CommonTabMenuItem>
          </template>
        </AppSelectButton>

        <template #actions>
          <span class="text-xs text-gray-400 mr-8">
            {{
              $t('leaderboard.lastUpdatedAt', {
                timestamp: formattedLastUpdatedAt
              })
            }}
          </span>

          <div class="h-10 flex items-center">
            <AppSelect
              v-model="resolution"
              :options="resolutionOptions"
              @update:model-value="fetchLeaderboard"
            >
              <template #prefix>
                <span class="text-xs text-gray-500">
                  {{ $t('leaderboard.resolution') }}
                </span>
              </template>

              <template #default="{ selected }">
                <span v-if="selected" class="text-xs text-blue-500">
                  {{ selected.display }}
                </span>
              </template>

              <template #option="{ option }">
                <span class="text-xs text-white">
                  {{ option.display }}
                </span>
              </template>
            </AppSelect>
          </div>
        </template>
      </CommonTabMenu>

      <PartialsLeaderboardTable :status="status" />
    </div>
  </div>
</template>
