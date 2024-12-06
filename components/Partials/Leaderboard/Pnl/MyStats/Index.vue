<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import {
  MAXIMUM_RANKED_TRADERS,
  MAXIMUM_LEADERBOARD_STATS_RANK,
  MIN_LEADERBOARD_PNL_AMOUNT
} from '@/app/utils/constants'
import { Modal, MainPage, BusEvents, LeaderboardDuration } from '@/types'

const modalStore = useSharedModalStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()

withDefaults(
  defineProps<{
    selectedDuration: LeaderboardDuration
  }>(),
  {}
)

const isShowMyStats = computed(() => {
  if (!leaderboardStore.pnlLeaderboard?.accountRow) {
    return false
  }

  const isTop100AndPositivePnL =
    new BigNumberInBase(leaderboardStore.pnlLeaderboard.accountRow.rank).lte(
      MAXIMUM_LEADERBOARD_STATS_RANK
    ) &&
    new BigNumberInBase(leaderboardStore.pnlLeaderboard.accountRow.pnl).gte(0)

  if (isTop100AndPositivePnL) {
    return true
  }

  const isMoreThanMinimumPnL = new BigNumberInBase(
    leaderboardStore.pnlLeaderboard.accountRow.pnl
  ).gte(MIN_LEADERBOARD_PNL_AMOUNT)
  const isTop500 = new BigNumberInBase(
    leaderboardStore.pnlLeaderboard.accountRow.pnl
  ).lte(MAXIMUM_RANKED_TRADERS)

  return isMoreThanMinimumPnL && isTop500
})

function onSharePnl() {
  modalStore.openModal(Modal.ShareLeaderboardPnl)

  useEventBus(BusEvents.ShareLeaderboardPnlOpened).emit()
}
</script>

<template>
  <div
    v-if="sharedWalletStore.isUserConnected && leaderboardStore.pnlLeaderboard"
  >
    <PartialsLeaderboardMyStats is-pnl v-bind="{ isUnranked: !isShowMyStats }">
      <template v-if="isShowMyStats" #add-on>
        <div
          class="flex bg-white bg-opacity-20 items-center gap-1 p-2 rounded-[4px] cursor-pointer relative"
          @click="onSharePnl"
        >
          <UIcon :name="NuxtUiIcons.Share2" class="min-w-4 w-4 h-4 -mt-1" />

          <p class="text-[11px] leading-[13px] font-medium">
            {{ $t('leaderboard.pnl.share') }}
          </p>
        </div>
      </template>

      <template #row>
        <div
          v-if="!isShowMyStats"
          class="relative flex flex-col items-center justify-center gap-4 sm:gap-6"
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

        <div v-else>
          <div class="hidden md:block">
            <PartialsLeaderboardPnlCommonHeader class="text-[11px]" />
            <PartialsLeaderboardPnlCommonRow
              v-bind="{
                leader: leaderboardStore.pnlLeaderboard.accountRow
              }"
              class="text-sm my-1 items-center text-white"
            />
          </div>

          <div class="md:hidden">
            <PartialsLeaderboardPnlMyStatsMobileRow
              v-bind="{
                leader: leaderboardStore.pnlLeaderboard.accountRow
              }"
            />
          </div>
        </div>
      </template>
    </PartialsLeaderboardMyStats>

    <ModalsShareLeaderboardPnl
      v-if="leaderboardStore.pnlLeaderboard.accountRow"
      v-bind="{
        selectedDuration,
        pnl: leaderboardStore.pnlLeaderboard.accountRow.pnl,
        rank: leaderboardStore.pnlLeaderboard.accountRow.rank
      }"
    />
  </div>
</template>
