<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { MIN_LEADERBOARD_PNL_AMOUNT } from '@/app/utils/constants'

const leaderboardStore = useLeaderboardStore()

const limit = ref(20)

const filteredPnlLeaderboard = computed(() => {
  if (!leaderboardStore.pnlLeaderboard?.leaders) {
    return []
  }

  return leaderboardStore.pnlLeaderboard.leaders.filter((leader) =>
    new BigNumberInBase(leader.pnl).gte(MIN_LEADERBOARD_PNL_AMOUNT)
  )
})

const formattedPnlLeaderboard = computed(() => {
  if (!filteredPnlLeaderboard.value) {
    return []
  }

  return filteredPnlLeaderboard.value.slice(0, limit.value)
})

function incrementLimit() {
  const LIMIT_INCREMENT_AMOUNT = 20

  limit.value += LIMIT_INCREMENT_AMOUNT
}
</script>

<template>
  <div class="mb-20">
    <PartialsLeaderboardPnlCommonHeader class="text-coolGray-350 text-[11px]" />
    <div v-if="filteredPnlLeaderboard.length > 0" class="relative">
      <PartialsLeaderboardPnlCommonRow
        v-for="leader in formattedPnlLeaderboard"
        :key="leader.rank"
        v-bind="{
          leader
        }"
        class="text-sm my-1 items-center rounded-lg bg-coolGray-825 py-4 text-white"
      />

      <PartialsLeaderboardTableBottomGradient
        v-if="formattedPnlLeaderboard.length !== filteredPnlLeaderboard.length"
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
        formattedPnlLeaderboard.length > 0 &&
        formattedPnlLeaderboard.length !== filteredPnlLeaderboard.length
      "
      @limit:increment="incrementLimit"
    />
  </div>
</template>
