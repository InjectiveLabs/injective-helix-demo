<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  MAXIMUM_RANKED_TRADERS,
  MIN_LEADERBOARD_TRADING_AMOUNT
} from '@/app/utils/constants'
import { Modal, MainPage, BusEvents, LeaderboardDuration } from '@/types'

const modalStore = useModalStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    selectedDuration: LeaderboardDuration
  }>(),
  {}
)

const status = reactive(new Status(StatusType.Loading))

const isUnranked = computed(() => {
  if (!leaderboardStore.pnlLeaderboardAccount) {
    return true
  }

  const isLowEarningsTrader = new BigNumberInBase(
    leaderboardStore.pnlLeaderboardAccount.pnl
  ).lt(MIN_LEADERBOARD_TRADING_AMOUNT)
  const isBottomRanked =
    leaderboardStore.pnlLeaderboardAccount.rank > MAXIMUM_RANKED_TRADERS

  return isLowEarningsTrader || isBottomRanked
})

onWalletConnected(() => {
  fetchPnlLeaderboardAccount()
})

function onSharePnl() {
  modalStore.openModal(Modal.ShareLeaderboardPnl)

  useEventBus(BusEvents.ShareLeaderboardPnlOpened).emit()
}

function fetchPnlLeaderboardAccount() {
  if (!sharedWalletStore.injectiveAddress) {
    return
  }

  status.setLoading()

  leaderboardStore
    .fetchPnlLeaderboardAccount({
      resolution: props.selectedDuration,
      account: sharedWalletStore.injectiveAddress
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div v-if="sharedWalletStore.isUserConnected">
    <AppHocLoading v-bind="{ status }">
      <PartialsLeaderboardMyStats is-pnl v-bind="{ isUnranked }">
        <template v-if="!isUnranked" #add-on>
          <div
            class="flex bg-white bg-opacity-20 items-center gap-1 p-2 rounded-[4px] cursor-pointer relative"
            @click="onSharePnl"
          >
            <SharedIcon name="share2" class="min-w-4 w-4 h-4 -mt-1" />

            <p class="text-[11px] leading-[13px] font-medium">
              {{ $t('leaderboard.pnl.share') }}
            </p>
          </div>
        </template>

        <template #row>
          <div
            v-if="isUnranked"
            class="relative flex flex-col items-center justify-center gap-6"
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

          <div v-else>
            <div class="hidden md:block">
              <PartialsLeaderboardPnlCommonHeader class="text-[11px]" />
              <PartialsLeaderboardPnlCommonRow
                v-bind="{
                  leader: leaderboardStore.pnlLeaderboardAccount
                }"
                class="text-sm my-1 items-center text-white"
              />
            </div>

            <div class="md:hidden">
              <PartialsLeaderboardPnlMyStatsMobileRow
                v-bind="{
                  leader: leaderboardStore.pnlLeaderboardAccount
                }"
              />
            </div>
          </div>
        </template>
      </PartialsLeaderboardMyStats>
    </AppHocLoading>

    <ModalsShareLeaderboardPnl
      v-if="leaderboardStore.pnlLeaderboardAccount"
      v-bind="{
        selectedDuration,
        pnl: leaderboardStore.pnlLeaderboardAccount.pnl,
        rank: leaderboardStore.pnlLeaderboardAccount.rank
      }"
    />
  </div>
</template>
