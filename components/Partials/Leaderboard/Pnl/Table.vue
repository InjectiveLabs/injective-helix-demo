<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { MIN_LEADERBOARD_TRADING_AMOUNT } from '@/app/utils/constants'

const leaderboardStore = useLeaderboardStore()

const limit = ref(20)

const filteredPnlLeaderboard = computed(() => {
  if (!leaderboardStore.pnlLeaderboard?.leaders) {
    return []
  }

  const highRankedTraders = leaderboardStore.pnlLeaderboard.leaders.filter(
    ({ pnl }) => new BigNumberInBase(pnl).gt(MIN_LEADERBOARD_TRADING_AMOUNT)
  )

  return highRankedTraders.slice(0, limit.value)
})

function incrementLimit() {
  const LIMIT_INCREMENT_AMOUNT = 20

  limit.value += LIMIT_INCREMENT_AMOUNT
}
</script>

<template>
  <div class="mb-20">
    <PartialsLeaderboardPnlCommonHeader class="text-gray-350 text-[11px]" />

    <div v-if="filteredPnlLeaderboard.length > 0" class="relative">
      <PartialsLeaderboardPnlCommonRow
        v-for="leader in filteredPnlLeaderboard"
        :key="leader.rank"
        v-bind="{
          leader
        }"
        class="text-sm my-1 items-center rounded-lg"
        :class="{
          'bg-gray-825 py-4 text-white': leader.rank > 3 || !leader.rank,
          'bg-[#F3C211] py-5 text-gray-1100': leader.rank === 1,
          'bg-[#AAAAAA] py-5 text-gray-1100': leader.rank === 2,
          'bg-[#BD7B31] py-5 text-gray-1100': leader.rank === 3
        }"
      />

      <PartialsLeaderboardTableBottomGradient
        v-if="
          filteredPnlLeaderboard.length !==
          leaderboardStore.pnlLeaderboard?.leaders.length
        "
      />
    </div>

    <CommonEmptyList
      v-else
      v-bind="{
        message: $t('leaderboard.pnl.noPnlData')
      }"
    />

    <PartialsLeaderboardViewMore
      v-if="
        filteredPnlLeaderboard.length > 0 &&
        filteredPnlLeaderboard.length !==
          leaderboardStore.pnlLeaderboard?.leaders.length
      "
      @limit:increment="incrementLimit"
    />
  </div>
</template>
