<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { LEADERBOARD_VOLUME_PER_ENTRY } from '@/app/utils/constants'
import { Modal, MainPage, BusEvents } from '@/types'

const modalStore = useModalStore()
const campaignStore = useCampaignStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const isStartTradingCTAVisible = computed(() => {
  if (!leaderboardStore.competitionLeaderboardAccount) {
    return true
  }

  const raffleTickets = new BigNumberInBase(
    leaderboardStore.competitionLeaderboardAccount.volume
  )
    .dividedBy(LEADERBOARD_VOLUME_PER_ENTRY)
    .integerValue(BigNumberInBase.ROUND_DOWN)

  return raffleTickets.isZero()
})

const isNegativePnL = computed(() => {
  if (!leaderboardStore.competitionLeaderboardAccount) {
    return false
  }

  return new BigNumberInBase(
    leaderboardStore.competitionLeaderboardAccount.pnl
  ).lte(0)
})

onWalletConnected(() => {
  fetchCompetitionLeaderboardAccount()
})

function fetchCompetitionLeaderboardAccount() {
  if (
    !campaignStore.activeCampaign ||
    !campaignStore.activeCampaignType ||
    !sharedWalletStore.injectiveAddress
  ) {
    return
  }

  status.setLoading()

  leaderboardStore
    .fetchCompetitionLeaderboardAccount({
      type: campaignStore.activeCampaignType,
      account: sharedWalletStore.injectiveAddress,
      duration: {
        startDate: campaignStore.activeCampaign.startDate,
        endDate: campaignStore.activeCampaign.endDate
      }
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

function onShareCompetition() {
  modalStore.openModal(Modal.ShareLeaderboardCompetition)

  useEventBus(BusEvents.ShareLeaderboardCompetitionOpened).emit()
}
</script>

<template>
  <div v-if="sharedWalletStore.isUserConnected">
    <AppHocLoading v-bind="{ status }">
      <PartialsLeaderboardMyStats
        v-bind="{ isUnranked: isStartTradingCTAVisible }"
      >
        <template v-if="!isStartTradingCTAVisible" #add-on>
          <div
            class="flex flex-col md:flex-row items-center justify-center gap-2"
          >
            <div
              class="hidden md:flex bg-green-450 items-center gap-1 px-2 py-1 rounded-[4px] cursor-pointer relative"
            >
              <p
                class="text-xs md:text-sm font-semibold leading-4 text-gray-925 uppercase"
              >
                {{ $t('leaderboard.competition.keepGoing') }}
              </p>
            </div>

            <div
              class="flex bg-white bg-opacity-20 items-center gap-1 p-2 rounded-[4px] cursor-pointer relative"
              @click="onShareCompetition"
            >
              <SharedIcon name="share2" class="min-w-4 w-4 h-4 -mt-1" />

              <p class="text-[11px] leading-[13px] font-medium">
                {{ $t('leaderboard.pnl.share') }}
              </p>
            </div>
          </div>
        </template>

        <template #row>
          <div v-if="isStartTradingCTAVisible">
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
              <div>
                <PartialsLeaderboardCompetitionCommonHeader
                  v-bind="{ isHideAmount: isNegativePnL }"
                  class="text-[11px]"
                />

                <PartialsLeaderboardCompetitionCommonRow
                  class="text-sm my-1 items-center text-white"
                  v-bind="{
                    leader: leaderboardStore.competitionLeaderboardAccount
                  }"
                />
              </div>
            </div>

            <div class="lg:hidden">
              <PartialsLeaderboardCompetitionMyStatsMobileRow
                v-bind="{
                  leader: leaderboardStore.competitionLeaderboardAccount
                }"
              />
            </div>
          </div>
        </template>
      </PartialsLeaderboardMyStats>
    </AppHocLoading>

    <ModalsShareLeaderboardCompetition
      v-if="leaderboardStore.competitionLeaderboardAccount"
      v-bind="{
        leader: leaderboardStore.competitionLeaderboardAccount
      }"
    />
  </div>
</template>
