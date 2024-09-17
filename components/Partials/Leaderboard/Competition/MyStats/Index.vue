<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  MAXIMUM_RANKED_TRADERS,
  MIN_LEADERBOARD_TRADING_AMOUNT
} from '@/app/utils/constants'
import { Modal, MainPage, BusEvents } from '@/types'

const modalStore = useModalStore()
const campaignStore = useCampaignStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const isUnranked = computed(() => {
  if (!leaderboardStore.competitionLeaderboardAccount) {
    return true
  }

  const isLowEarningsTrader =
    new BigNumberInBase(leaderboardStore.competitionLeaderboardAccount.pnl).lt(
      MIN_LEADERBOARD_TRADING_AMOUNT
    ) &&
    new BigNumberInBase(
      leaderboardStore.competitionLeaderboardAccount.volume
    ).lt(MIN_LEADERBOARD_TRADING_AMOUNT)
  const isBottomRanked =
    leaderboardStore.competitionLeaderboardAccount.rank > MAXIMUM_RANKED_TRADERS

  return isLowEarningsTrader || isBottomRanked
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
      <PartialsLeaderboardMyStats v-bind="{ isUnranked }">
        <template v-if="!isUnranked" #add-on>
          <div
            class="flex flex-col lg:flex-row items-center justify-center gap-2"
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
          <div v-if="isUnranked">
            <div
              class="flex flex-col items-center justify-center gap-6 relative"
            >
              <div class="tracking-[0.4px] leading-5">
                {{ $t('leaderboard.getTradingDescription') }}
              </div>
              <NuxtLink :to="{ name: MainPage.Markets }">
                <AppButton
                  class="border-white px-4 py-2.5 font-medium leading-4"
                  v-bind="{ variant: 'primary-outline' }"
                >
                  {{ $t('leaderboard.getTrading') }}
                </AppButton>
              </NuxtLink>
            </div>
          </div>
          <div v-else>
            <div class="hidden lg:block">
              <div>
                <PartialsLeaderboardCompetitionCommonHeader
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
