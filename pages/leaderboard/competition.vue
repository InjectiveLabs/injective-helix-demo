<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { sharedGetDuration } from '@shared/utils/time'
import { LeaderboardType } from '@/types'

const campaignStore = useCampaignStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const userStats = computed(() => {
  if (!leaderboardStore.leaderboard?.leaders) {
    return
  }

  return leaderboardStore.leaderboard.leaders.find(
    (leader) => leader.account === sharedWalletStore.address
  )
})

const now = useNow({ interval: 1000 })

const timeLeftInCampaign = computed(() => {
  if (!campaignStore.activeCampaign) {
    return
  }

  const duration = sharedGetDuration({
    endDateInMilliseconds: campaignStore.activeCampaign.endDate,
    nowInMilliseconds: now.value.getTime().toString()
  })

  return `${String(duration.days).padStart(2, '0')}:${String(
    duration.hours
  ).padStart(2, '0')}:${String(duration.minutes).padStart(2, '0')}:${String(
    duration.seconds
  ).padStart(2, '0')}`
})

const amount = computed(() =>
  campaignStore.activeCampaignType === LeaderboardType.Volume
    ? userStats.value?.volume
    : userStats.value?.pnl
)

onMounted(() => {
  fetchCampaign()
})

function fetchCampaign() {
  status.setLoading()

  campaignStore
    .fetchCampaigns(true)
    .then(async () => {
      if (!campaignStore.activeCampaign || !campaignStore.activeCampaignType) {
        return
      }

      return await leaderboardStore.fetchLeaderboard({
        type: campaignStore.activeCampaignType,
        duration: {
          startDate: Number(campaignStore.activeCampaign.startDate),
          endDate: Number(campaignStore.activeCampaign.endDate)
        }
      })
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div>
    <AppHocLoading v-bind="{ status }">
      <div class="overflow-x-auto">
        <Teleport v-if="campaignStore.activeCampaign" to="#campaign-time-left">
          <i18n-t
            tag="p"
            keypath="leaderboard.competition.competitionDuration"
            class="text-xs md:text-base leading-5 text-gray-350 flex items-center"
          >
            <template #duration>
              <div
                class="text-sm md:text-xl leading-6 font-bold text-white ml-2"
              >
                {{ timeLeftInCampaign }}
              </div>
            </template>
          </i18n-t>
        </Teleport>

        <div class="w-full text-sm relative">
          <PartialsLeaderboardCompetitionBanner class="hidden xl:block" />

          <PartialsLeaderboardMyStats v-if="userStats">
            <template #add-on>
              <div
                class="hidden md:flex bg-green-450 items-center gap-1 px-2 py-1 rounded-[4px] cursor-pointer relative"
              >
                <p
                  class="text-xs md:text-sm font-semibold leading-4 text-gray-925 uppercase"
                >
                  {{ $t('leaderboard.competition.keepGoing') }}
                </p>
              </div>
            </template>

            <template #row>
              <div>
                <div class="hidden lg:block">
                  <PartialsLeaderboardCompetitionMyStatsRow
                    v-bind="{
                      amount,
                      rank: userStats.rank,
                      account: userStats.account
                    }"
                  />
                </div>

                <div class="lg:hidden">
                  <PartialsLeaderboardCompetitionMyStatsMobileRow
                    v-bind="{
                      amount,
                      rank: userStats.rank,
                      account: userStats.account
                    }"
                  />
                </div>
              </div>
            </template>
          </PartialsLeaderboardMyStats>

          <PartialsLeaderboardCompetitionTable />
        </div>
      </div>
    </AppHocLoading>
  </div>
</template>
