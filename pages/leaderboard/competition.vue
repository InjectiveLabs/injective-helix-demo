<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { sharedGetDuration } from '@shared/utils/time'
import { Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useModalStore()
const campaignStore = useCampaignStore()
const leaderboardStore = useLeaderboardStore()
const { $onError } = useNuxtApp()

const isExactStartOfCampaign = ref(false)
const isCountdownTimerVisible = ref(false)
const status = reactive(new Status(StatusType.Loading))

const firstCampaignStartTimeInMs = '1727740800000'

const now = useNow({ interval: 1000 })

const timeLeftInCampaign = computed(() => {
  if (!campaignStore.activeCampaign) {
    return
  }

  const duration = sharedGetDuration({
    endDateInMilliseconds: campaignStore.activeCampaign.endDate,
    nowInMilliseconds: now.value.getTime().toString()
  })

  return `${String(duration.days).padStart(2, '0')}D ${String(
    duration.hours
  ).padStart(2, '0')}:${String(duration.minutes).padStart(2, '0')}:${String(
    duration.seconds
  ).padStart(2, '0')}`
})

const countdownFormatted = computed(() => {
  const nowInMilliseconds = now.value.getTime().toString()

  const duration = sharedGetDuration({
    endDateInMilliseconds: firstCampaignStartTimeInMs,
    nowInMilliseconds
  })

  return `${String(duration.days).padStart(2, '0')}:${String(
    duration.hours
  ).padStart(2, '0')}:${String(duration.minutes).padStart(2, '0')}:${String(
    duration.seconds
  ).padStart(2, '0')}`
})

const isActiveCampaign = computed(() =>
  new BigNumberInBase(now.value.getTime()).gte(firstCampaignStartTimeInMs)
)

onMounted(() => {
  fetchCampaign()

  if (appStore.userState.modalsViewed.includes(Modal.LeaderboardTerms)) {
    return
  }

  modalStore.openModal(Modal.LeaderboardTerms)
})

function fetchCampaign() {
  status.setLoading()

  campaignStore
    .fetchActiveCampaign()
    .then(async () => {
      if (!campaignStore.activeCampaign || !campaignStore.activeCampaignType) {
        isCountdownTimerVisible.value = true

        return
      }

      await leaderboardStore.fetchCompetitionLeaderboard({
        type: campaignStore.activeCampaignType,
        duration: {
          startDate: campaignStore.activeCampaign.startDate,
          endDate: campaignStore.activeCampaign.endDate
        }
      })
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

watch(isActiveCampaign, (isActive: boolean) => {
  if (isActive) {
    isExactStartOfCampaign.value = true
  }
})
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

        <div v-if="isCountdownTimerVisible" class="relative">
          <div class="text-3xl font-bold tracking-[0.4px] mb-2">
            {{
              $t(
                `leaderboard.competition.${
                  isExactStartOfCampaign
                    ? 'competitionHasBegun'
                    : 'competitionBeginning'
                }`
              )
            }}
          </div>
          <div
            class="font-rubik text-[54px] tracking-[0.4px] mb-10 competition-gradient-text"
          >
            {{ countdownFormatted }}
          </div>

          <SharedRainConfetti
            v-if="isExactStartOfCampaign"
            class="absolute inset-0 h-48 -mt-9 w-full"
          />
        </div>

        <div class="w-full text-sm relative">
          <PartialsLeaderboardCompetitionBanner />

          <PartialsLeaderboardCompetitionMyStats
            v-if="
              campaignStore.activeCampaign && campaignStore.activeCampaignType
            "
          />

          <PartialsLeaderboardCompetitionTable />
        </div>
      </div>
    </AppHocLoading>

    <ModalsLeaderboardTerms />
  </div>
</template>

<style>
.competition-table,
.competition-table-mobile {
  @apply grid grid-cols-6 md:grid-cols-9 relative;

  > :nth-child(1) {
    @apply pl-3 lg:pl-7 text-left col-span-1 flex items-center;
  }

  > :nth-child(2) {
    @apply text-left col-span-2 md:col-span-5 flex items-center;
  }
}

.competition-table {
  > :nth-child(3) {
    @apply text-left col-span-2 mr-0.5;
  }

  > :nth-child(4) {
    @apply text-right md:text-left col-span-1 mr-0.5;
  }
}

.competition-table-mobile {
  > :nth-child(3) {
    @apply flex flex-col col-span-3 items-end;
  }
}

.competition-gradient-text {
  background: linear-gradient(124deg, #fff 35.59%, #76838e 99.6%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
