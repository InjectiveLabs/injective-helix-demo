<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { sharedGetDuration } from '@shared/utils/time'
import { format, isWithinInterval, addHours } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { UTC_TIMEZONE } from '@shared/utils/constant'
import { UPCOMING_LEADERBOARD_CAMPAIGN_NAME } from '@/app/data/campaign'
import { Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useModalStore()
const campaignStore = useCampaignStore()
const { $onError } = useNuxtApp()

const upcomingCampaignStatus = reactive(new Status(StatusType.Idle))
const activeCampaignStatus = reactive(new Status(StatusType.Idle))

const now = useNow({ interval: 1000 })

/** upcoming campaign countdown */
const upcomingCampaign = computed(() => {
  if (!campaignStore.pnlOrVolumeCampaigns) {
    return
  }

  return campaignStore.pnlOrVolumeCampaigns.find(
    ({ name }) => name === UPCOMING_LEADERBOARD_CAMPAIGN_NAME
  )
})

const countdownUntilCampaignStart = computed(() => {
  if (!campaignStore.pnlOrVolumeCampaigns || !upcomingCampaign.value) {
    return
  }

  const nowInMilliseconds = now.value.getTime().toString()

  const duration = sharedGetDuration({
    nowInMilliseconds,
    endDateInMilliseconds: upcomingCampaign.value.startDate
  })

  const days = `${String(duration.days).padStart(2, '0')}`
  const hours = `${String(duration.hours).padStart(2, '0')}`
  const minutes = `${String(duration.minutes).padStart(2, '0')}`
  const seconds = `${String(duration.seconds).padStart(2, '0')}`

  return `${days}:${hours}:${minutes}:${seconds}`
})

const isCampaignStarted = computed(() => {
  if (!upcomingCampaign.value) {
    return
  }

  return new BigNumberInBase(now.value.getTime()).gt(
    upcomingCampaign.value.startDate
  )
})

/** first hour of campaign countdown **/
const endOfCampaignFirstHour = computed(() => {
  if (!campaignStore.activeCampaign) {
    return
  }

  const startDate = new Date(Number(campaignStore.activeCampaign.startDate))

  return addHours(startDate, 1).getTime()
})

const endOfCampaignFirstHourInUTC = computed(() => {
  if (!endOfCampaignFirstHour.value) {
    return
  }

  const zonedFirstDate = utcToZonedTime(
    endOfCampaignFirstHour.value,
    UTC_TIMEZONE
  )

  return format(zonedFirstDate, "H:mm 'UTC'")
})

const isDuringFirstHourOfCampaign = computed(() => {
  if (!campaignStore.activeCampaign || !endOfCampaignFirstHour.value) {
    return
  }

  const startDate = new Date(
    Number(campaignStore.activeCampaign.startDate)
  ).getTime()

  return isWithinInterval(now.value, {
    start: startDate,
    end: endOfCampaignFirstHour.value
  })
})

/** end of campaign countdown **/
const timeLeftInActiveCampaign = computed(() => {
  if (!campaignStore.activeCampaign) {
    return
  }

  const duration = sharedGetDuration({
    endDateInMilliseconds: campaignStore.activeCampaign.endDate,
    nowInMilliseconds: now.value.getTime().toString()
  })

  const days = `${String(duration.days).padStart(2, '0')}`
  const hours = `${String(duration.hours).padStart(2, '0')}`
  const minutes = `${String(duration.minutes).padStart(2, '0')}`
  const seconds = `${String(duration.seconds).padStart(2, '0')}`

  return `${days}D ${hours}:${minutes}:${seconds}`
})

onMounted(() => {
  fetchUpcomingCampaigns()
  fetchActiveCampaigns()

  if (appStore.userState.modalsViewed.includes(Modal.LeaderboardTerms)) {
    return
  }

  modalStore.openModal(Modal.LeaderboardTerms)
})

function fetchUpcomingCampaigns() {
  upcomingCampaignStatus.setLoading()

  campaignStore
    .fetchUpcomingCampaigns()
    .catch($onError)
    .finally(() => upcomingCampaignStatus.setIdle())
}

function fetchActiveCampaigns() {
  activeCampaignStatus.setLoading()

  campaignStore
    .fetchActiveCampaign()
    .catch($onError)
    .finally(() => activeCampaignStatus.setIdle())
}

watch(isCampaignStarted, (isStarted) => {
  if (isStarted) {
    fetchActiveCampaigns()
  }
})
</script>

<template>
  <div>
    <AppHocLoading
      v-bind="{
        isLoading:
          upcomingCampaignStatus.isLoading() || activeCampaignStatus.isLoading()
      }"
    >
      <div class="overflow-x-auto">
        <Teleport
          v-if="campaignStore.activeCampaign"
          to="#campaign-time-left"
          defer
        >
          <i18n-t
            tag="p"
            keypath="leaderboard.competition.competitionDuration"
            class="text-xs md:text-base leading-5 text-gray-350 flex items-center"
          >
            <template #duration>
              <div
                class="text-sm md:text-xl leading-6 font-bold text-white ml-2"
              >
                {{ timeLeftInActiveCampaign }}
              </div>
            </template>
          </i18n-t>
        </Teleport>

        <div class="w-full text-sm relative">
          <PartialsLeaderboardCompetitionBanner />

          <PartialsLeaderboardCompetition
            v-if="campaignStore.activeCampaign && !isDuringFirstHourOfCampaign"
          />

          <div
            v-else-if="isDuringFirstHourOfCampaign"
            class="mb-20 text-2xl sm:text-3xl font-bold tracking-[0.4px]"
          >
            {{
              $t('leaderboard.competition.firstHourOfCampaign', {
                afterFirstHour: endOfCampaignFirstHourInUTC
              })
            }}
          </div>

          <div v-else class="relative mb-20">
            <div class="text-2xl sm:text-3xl font-bold tracking-[0.4px] mb-2">
              {{ $t('leaderboard.competition.competitionBeginning') }}
            </div>
            <div
              class="font-rubik text-3xl sm:text-[54px] sm:leading-[54px] tracking-[0.4px] competition-gradient-text"
            >
              {{ countdownUntilCampaignStart }}
            </div>
          </div>
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
    @apply pl-3 xl:pl-7 text-left col-span-1 flex items-center;
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
