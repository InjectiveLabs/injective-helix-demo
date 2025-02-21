<script lang="ts" setup>
import { CampaignV2 } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedGetDuration } from '@shared/utils/time'
import { format, isWithinInterval, addHours, isAfter } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { UTC_TIMEZONE } from '@shared/utils/constant'
import { UPCOMING_LEADERBOARD_CAMPAIGN_NAME } from '@/app/data/campaign'
import { Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()
const campaignStore = useCampaignStore()

const emit = defineEmits<{
  'campaigns:fetch': []
}>()

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

  // return addHours(startDate, 1).getTime()
  return addHours(startDate, 2).getTime()
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

const isCampaignOver = computed(() => {
  if (!campaignStore.activeCampaign) {
    return
  }

  const campaignEndDate = new Date(Number(campaignStore.activeCampaign.endDate))

  return isAfter(now.value, campaignEndDate)
})

onMounted(() => {
  if (appStore.userState.modalsViewed.includes(Modal.LeaderboardTerms)) {
    return
  }

  modalStore.openModal(Modal.LeaderboardTerms)
})

watch(isCampaignStarted, (isStarted) => {
  if (isStarted) {
    emit('campaigns:fetch')
  }
})
</script>

<template>
  <div>
    <div class="overflow-x-auto">
      <PartialsLeaderboardCompetitionOwnYourAssetBanner
        v-if="upcomingCampaign || campaignStore.activeCampaign"
        v-bind="{
          campaign: (campaignStore.activeCampaign ||
            upcomingCampaign) as CampaignV2
        }"
      />

      <!-- Active Campaign -->
      <template v-if="campaignStore.activeCampaign && !isCampaignOver">
        <Teleport to="#leaderboard-target" defer>
          <CommonHeaderTooltip
            :tooltip="$t('leaderboard.refresh')"
            class="text-xs md:text-sm md:leading-4 text-coolGray-350 border-b cursor-pointer border-dashed border-coolGray-350"
            is-not-styled
          >
            <i18n-t
              tag="p"
              keypath="leaderboard.competition.competitionDuration"
              class="text-xs md:text-base leading-5 text-coolGray-350 flex items-center"
            >
              <template #duration>
                <div
                  class="text-sm md:text-xl leading-6 font-bold text-white ml-2"
                >
                  {{ timeLeftInActiveCampaign }}
                </div>
              </template>
            </i18n-t>
          </CommonHeaderTooltip>
        </Teleport>

        <div class="w-full text-sm relative">
          <PartialsLeaderboardCompetition
            v-if="!isDuringFirstHourOfCampaign"
            v-bind="{ campaign: campaignStore.activeCampaign }"
          />

          <div
            v-else
            class="mb-20 text-2xl sm:text-3xl font-bold tracking-[0.4px]"
          >
            {{
              $t('leaderboard.competition.firstHourOfCampaign', {
                afterFirstHour: endOfCampaignFirstHourInUTC
              })
            }}
          </div>
        </div>
      </template>

      <!-- Upcoming Campaign -->
      <div
        v-else-if="countdownUntilCampaignStart"
        class="w-full text-sm relative"
      >
        <div class="relative mb-20">
          <div class="text-2xl sm:text-3xl font-bold tracking-[0.4px] mb-2">
            {{ $t('leaderboard.competition.competitionBeginning') }}
          </div>
          <div
            class="font-rubik text-2xl sm:text-[54px] sm:leading-[54px] tracking-[0.4px] competition-gradient-text"
          >
            {{ countdownUntilCampaignStart }}
          </div>
        </div>
      </div>

      <!-- No Campaign -->
      <div v-else class="w-full text-sm relative mb-20">
        <div class="text-2xl sm:text-3xl font-bold tracking-[0.4px] mb-2">
          {{ $t('leaderboard.competition.noCompetition') }}
        </div>
      </div>
    </div>

    <ModalsLeaderboardTerms v-if="campaignStore.activeCampaign" />
  </div>
</template>
