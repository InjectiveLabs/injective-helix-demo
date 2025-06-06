<script lang="ts" setup>
import { CampaignV2 } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import { MIN_LEADERBOARD_PNL_AMOUNT } from '@/app/utils/constants'
import {
  checkIsCampaignWithEntries,
  competitionVolumePerEntryMap,
  CAMPAIGNS_WITH_ANNOUNCED_WINNERS
} from '@/app/data/campaign'
import {
  Modal,
  MainPage,
  BusEvents,
  LeaderboardType,
  LeaderboardSubPage
} from '@/types'

const route = useRoute()
const modalStore = useSharedModalStore()
const campaignStore = useCampaignStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    campaign: CampaignV2
  }>(),
  {}
)

const isUserWithoutRaffleTickets = computed(() => {
  if (!leaderboardStore.competitionLeaderboard?.accountRow) {
    return true
  }

  const raffleTickets = new BigNumberInBase(
    leaderboardStore.competitionLeaderboard.accountRow.volume
  )
    .dividedBy(competitionVolumePerEntryMap[props.campaign.name] || 1000)
    .integerValue(BigNumberInBase.ROUND_DOWN)

  return raffleTickets.isZero()
})

const isNegativePnL = computed(() => {
  if (!leaderboardStore.competitionLeaderboard?.accountRow) {
    return false
  }

  return new BigNumberInBase(
    leaderboardStore.competitionLeaderboard.accountRow.pnl
  ).lte(0)
})

const isUnranked = computed(() => {
  if (checkIsCampaignWithEntries(props.campaign.name)) {
    return isUserWithoutRaffleTickets.value
  }

  if (!leaderboardStore.competitionLeaderboard?.accountRow) {
    return true
  }

  return new BigNumberInBase(
    leaderboardStore.competitionLeaderboard.accountRow.pnl
  ).lte(MIN_LEADERBOARD_PNL_AMOUNT)
})

const isShowMyStats = computed(() => {
  if (!sharedWalletStore.isUserConnected) {
    return false
  }

  if (route.name !== LeaderboardSubPage.PastCompetitions) {
    return true
  }

  return !isUnranked.value
})

function onShareCompetition() {
  modalStore.openModal(Modal.ShareLeaderboardStats)

  useEventBus(BusEvents.ShareLeaderboardStatsOpened).emit()
}
</script>

<template>
  <div v-if="isShowMyStats && leaderboardStore.competitionLeaderboard">
    <PartialsLeaderboardMyStats v-bind="{ isUnranked: isUnranked }">
      <template v-if="!isUnranked" #add-on>
        <div
          class="hidden sm:flex items-center gap-1 px-2 py-1 rounded-[4px] cursor-pointer relative"
          :class="[
            route.name !== LeaderboardSubPage.PastCompetitions ||
            campaignStore.leaderboardCompetitionResult
              ? 'bg-green-450 uppercase'
              : 'bg-white'
          ]"
        >
          <p
            class="text-xs md:text-sm font-semibold leading-4 text-coolGray-925 max-w-[300px] lg:max-w-[480px]"
          >
            <span v-if="route.name !== LeaderboardSubPage.PastCompetitions">
              {{ $t('leaderboard.competition.keepGoing') }}
            </span>
            <span v-else-if="campaignStore.leaderboardCompetitionResult">
              {{ $t('leaderboard.competition.winner') }}
            </span>
            <span
              v-else-if="
                CAMPAIGNS_WITH_ANNOUNCED_WINNERS.includes(campaign.name)
              "
            >
              {{ $t('leaderboard.competition.thanksForParticipating') }}
            </span>
            <span v-else>
              {{ $t('leaderboard.competition.checkBackLater') }}
            </span>
          </p>
        </div>

        <div
          v-if="route.name !== LeaderboardSubPage.PastCompetitions"
          class="flex bg-white bg-opacity-20 items-center gap-1 p-2 rounded-[4px] cursor-pointer relative"
          @click="onShareCompetition"
        >
          <UIcon :name="NuxtUiIcons.Share2" class="min-w-4 w-4 h-4 -mt-1" />

          <p class="text-[11px] leading-[13px] font-medium">
            {{ $t('leaderboard.pnl.share') }}
          </p>
        </div>
      </template>

      <template #row>
        <div v-if="isUnranked">
          <div
            class="flex flex-col items-center justify-center gap-4 sm:gap-6 relative"
          >
            <div
              class="text-xs sm:text-base tracking-[0.4px] leading-5 max-sm:mt-2 px-20"
            >
              {{ $t('leaderboard.tradeAndWin') }}
            </div>
            <NuxtLink :to="{ name: MainPage.Markets }">
              <AppButton
                class="border-white p-2 max-sm:text-xs sm:px-4"
                v-bind="{ variant: 'primary-outline' }"
              >
                {{ $t('leaderboard.startTrading') }}
              </AppButton>
            </NuxtLink>
          </div>
        </div>

        <div v-else>
          <div class="hidden lg:block">
            <PartialsLeaderboardCompetitionCommonHeader
              v-bind="{ campaign, isHideAmount: isNegativePnL }"
              class="text-[11px]"
            />

            <PartialsLeaderboardCompetitionCommonRow
              class="text-sm my-1 items-center text-white"
              v-bind="{
                campaign,
                leader: leaderboardStore.competitionLeaderboard.accountRow
              }"
            />
          </div>

          <div class="lg:hidden">
            <PartialsLeaderboardCompetitionMyStatsMobileRow
              v-bind="{
                campaign,
                leader: leaderboardStore.competitionLeaderboard.accountRow
              }"
            />
          </div>
        </div>
      </template>
    </PartialsLeaderboardMyStats>

    <ModalsShareLeaderboardStats
      v-if="leaderboardStore.competitionLeaderboard.accountRow"
      v-bind="{
        isVolumeCampaign: campaign.type === LeaderboardType.Volume,
        pnl: leaderboardStore.competitionLeaderboard.accountRow.pnl,
        rank: leaderboardStore.competitionLeaderboard.accountRow.rank,
        volume: leaderboardStore.competitionLeaderboard.accountRow.volume
      }"
    />
  </div>
</template>
