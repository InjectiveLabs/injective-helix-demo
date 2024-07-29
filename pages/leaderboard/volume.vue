<script lang="ts" setup>
import { Status, BigNumberInBase, StatusType } from '@injectivelabs/utils'
import { sharedGetDuration } from '@shared/utils/formatter'
import { Modal, BusEvents, LeaderboardType } from '@/types'

const modalStore = useModalStore()
const campaignStore = useCampaignStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const userStats = computed(() => {
  if (!campaignStore.leaderboard?.leaders) {
    return
  }

  return campaignStore.leaderboard.leaders.find(
    (leader) => leader.account === sharedWalletStore.address
  )
})

const now = useNow({ interval: 1000 })

const timeLeftInCampaign = computed(() => {
  if (!campaignStore.activeCampaignByType) {
    return
  }

  const duration = sharedGetDuration({
    endDateInMilliseconds: campaignStore.activeCampaignByType.endDate,
    nowInMilliseconds: new BigNumberInBase(now.value.getTime())
  })

  return `${String(duration.days).padStart(2, '0')}:${String(
    duration.hours
  ).padStart(2, '0')}:${String(duration.minutes).padStart(2, '0')}:${String(
    duration.seconds
  ).padStart(2, '0')}`
})

onMounted(() => {
  fetchCampaign()
})

function fetchCampaign() {
  status.setLoading()

  campaignStore
    .fetchActiveCampaigns(LeaderboardType.Volume)
    .then(async () => {
      await campaignStore
        .fetchLeaderboard({
          type: LeaderboardType.Pnl
          // duration: { startDate, endDate } // todo
        })
        .catch($onError)
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
    <AppHocLoading v-bind="{ status }">
      <div class="overflow-x-auto">
        <Teleport to="#campaign-time-left">
          <i18n-t
            tag="p"
            keypath="leaderboard.competitionDuration"
            class="text-base leading-5 text-gray-350 flex"
          >
            <template #duration>
              <div class="text-xl leading-6 font-bold text-white ml-2">
                {{ timeLeftInCampaign }}
              </div>
            </template>
          </i18n-t>
        </Teleport>

        <div class="w-full min-w-[750px] text-sm relative">
          <PartialsLeaderboardMyStats v-if="userStats">
            <template #add-on>
              <div
                class="flex bg-green-450 items-center gap-1 px-2 py-1 rounded-[4px] cursor-pointer relative"
                @click="onSharePnl"
              >
                <SharedIcon name="share2" class="min-w-4 w-4 h-4 -mt-1" />

                <p class="text-[11px] leading-[13px] font-medium">
                  {{ $t('leaderboard.share') }}
                </p>
              </div>
            </template>

            <template #row>
              <div>
                <PartialsLeaderboardPnlTableWrapper class="text-[11px]">
                  <PartialsLeaderboardPnlHeader />
                </PartialsLeaderboardPnlTableWrapper>

                <PartialsLeaderboardPnlTableWrapper
                  class="text-sm my-1 items-center text-white"
                >
                  <PartialsLeaderboardPnlRow
                    v-bind="{
                      pnl: userStats.pnl,
                      rank: userStats.rank,
                      account: userStats.account
                    }"
                  />
                </PartialsLeaderboardPnlTableWrapper>
              </div>
            </template>
          </PartialsLeaderboardMyStats>

          <PartialsLeaderboardPnlTable />
        </div>
      </div>
    </AppHocLoading>
  </div>
</template>
