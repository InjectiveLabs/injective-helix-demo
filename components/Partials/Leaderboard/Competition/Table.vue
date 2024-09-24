<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'

import { MIN_LEADERBOARD_TRADING_AMOUNT } from '@/app/utils/constants'

const leaderboardStore = useLeaderboardStore()

const limit = ref(20)

const filteredVolumeLeaderboard = computed(() => {
  if (!leaderboardStore.competitionLeaderboard?.leaders) {
    return []
  }

  return leaderboardStore.competitionLeaderboard.leaders.filter((leader) =>
    new BigNumberInBase(leader.pnl).gte(MIN_LEADERBOARD_TRADING_AMOUNT)
  )
})

const formattedVolumeLeaderboard = computed(() => {
  if (!filteredVolumeLeaderboard.value) {
    return []
  }

  return filteredVolumeLeaderboard.value.slice(0, limit.value)
})

function incrementLimit() {
  const LIMIT_INCREMENT_AMOUNT = 20

  limit.value += LIMIT_INCREMENT_AMOUNT
}
</script>

<template>
  <div class="mb-20">
    <PartialsLeaderboardCompetitionCommonHeader
      class="text-gray-350 text-[11px]"
    />

    <div v-if="formattedVolumeLeaderboard.length > 0" class="relative">
      <PartialsLeaderboardCompetitionCommonRow
        v-for="leader in formattedVolumeLeaderboard"
        :key="leader.rank"
        v-bind="{
          leader
        }"
        class="text-sm my-1 items-center rounded-lg"
        :class="{
          'bg-gray-825 py-4 text-white': leader.rank > 1,
          'bg-[#F3C211] py-5 text-gray-1100': leader.rank === 1
        }"
      />

      <PartialsLeaderboardTableBottomGradient
        v-if="
          formattedVolumeLeaderboard.length !== filteredVolumeLeaderboard.length
        "
      />
    </div>

    <CommonEmptyList
      v-else
      v-bind="{
        message: $t('leaderboard.competition.noVolumeData')
      }"
    />

    <PartialsLeaderboardViewMore
      v-if="
        formattedVolumeLeaderboard.length > 0 &&
        formattedVolumeLeaderboard.length !== filteredVolumeLeaderboard.length
      "
      @limit:increment="incrementLimit"
    />
  </div>
</template>
