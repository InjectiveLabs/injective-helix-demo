<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { LEADERBOARD_VOLUME_PER_ENTRY } from '@/app/utils/constants'
import { Modal, MainPage, BusEvents, LeaderboardSubPage } from '@/types'

const route = useRoute()
const modalStore = useModalStore()
const campaignStore = useCampaignStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()

const isUserWithoutRaffleTickets = computed(() => {
  if (!leaderboardStore.competitionLeaderboard?.accountRow) {
    return true
  }

  const raffleTickets = new BigNumberInBase(
    leaderboardStore.competitionLeaderboard.accountRow.volume
  )
    .dividedBy(LEADERBOARD_VOLUME_PER_ENTRY)
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

const isShowMyStats = computed(() => {
  if (!sharedWalletStore.isUserConnected) {
    return false
  }

  if (route.name !== LeaderboardSubPage.PastCompetitions) {
    return true
  }

  return !isUserWithoutRaffleTickets.value
})

function onShareCompetition() {
  modalStore.openModal(Modal.ShareLeaderboardCompetition)

  useEventBus(BusEvents.ShareLeaderboardCompetitionOpened).emit()
}
</script>

<template>
  <div v-if="isShowMyStats && leaderboardStore.competitionLeaderboard">
    <PartialsLeaderboardMyStats
      v-bind="{ isUnranked: isUserWithoutRaffleTickets }"
    >
      <template v-if="!isUserWithoutRaffleTickets" #add-on>
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
            class="text-xs md:text-sm font-semibold leading-4 text-gray-925 max-w-[300px] lg:max-w-[480px]"
          >
            <span v-if="route.name !== LeaderboardSubPage.PastCompetitions">
              {{ $t('leaderboard.competition.keepGoing') }}
            </span>
            <span v-else-if="campaignStore.leaderboardCompetitionResult">
              {{ $t('leaderboard.competition.winner') }}
            </span>
            <span v-else>
              {{ $t('leaderboard.competition.thanksForParticipating') }}
            </span>
          </p>
        </div>

        <div
          v-if="route.name !== LeaderboardSubPage.PastCompetitions"
          class="flex bg-white bg-opacity-20 items-center gap-1 p-2 rounded-[4px] cursor-pointer relative"
          @click="onShareCompetition"
        >
          <SharedIcon name="share2" class="min-w-4 w-4 h-4 -mt-1" />

          <p class="text-[11px] leading-[13px] font-medium">
            {{ $t('leaderboard.pnl.share') }}
          </p>
        </div>
      </template>

      <template #row>
        <div v-if="isUserWithoutRaffleTickets">
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
                class="border-white p-2 text-xs sm:text-sm sm:px-4 sm:py-2.5 sm:font-medium sm:leading-4"
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
              v-bind="{ ...$attrs, isHideAmount: isNegativePnL }"
              class="text-[11px]"
            />

            <PartialsLeaderboardCompetitionCommonRow
              class="text-sm my-1 items-center text-white"
              v-bind="{
                ...$attrs,
                leader: leaderboardStore.competitionLeaderboard.accountRow
              }"
            />
          </div>

          <div class="lg:hidden">
            <PartialsLeaderboardCompetitionMyStatsMobileRow
              v-bind="{
                ...$attrs,
                leader: leaderboardStore.competitionLeaderboard.accountRow
              }"
            />
          </div>
        </div>
      </template>
    </PartialsLeaderboardMyStats>

    <ModalsShareLeaderboardCompetition
      v-if="leaderboardStore.competitionLeaderboard.accountRow"
      v-bind="{ leader: leaderboardStore.competitionLeaderboard.accountRow }"
    />
  </div>
</template>
