<script lang="ts" setup>
const leaderboardStore = useLeaderboardStore()

const limit = ref(20)

const filteredPnlLeaderboard = computed(() => {
  if (!leaderboardStore.leaderboard?.leaders) {
    return []
  }

  return leaderboardStore.leaderboard.leaders.slice(0, limit.value)
})

function incrementLimit() {
  const LIMIT_INCREMENT_AMOUNT = 20

  limit.value += LIMIT_INCREMENT_AMOUNT
}
</script>

<template>
  <div class="mb-20">
    <PartialsLeaderboardPnlCommonTableWrapper class="text-gray-350 text-[11px]">
      <PartialsLeaderboardPnlCommonHeader />
    </PartialsLeaderboardPnlCommonTableWrapper>

    <div v-if="filteredPnlLeaderboard.length > 0" class="relative">
      <template v-for="leader in filteredPnlLeaderboard" :key="leader.rank">
        <PartialsLeaderboardPnlCommonTableWrapper
          class="text-sm my-1 items-center rounded-lg"
          :class="{
            'bg-gray-825 py-4 text-white': leader.rank > 3,
            'bg-[#F3C211] py-5 text-gray-1100': leader.rank === 1,
            'bg-[#AAAAAA] py-5 text-gray-1100': leader.rank === 2,
            'bg-[#BD7B31] py-5 text-gray-1100': leader.rank === 3
          }"
        >
          <PartialsLeaderboardPnlCommonRow
            v-bind="{
              rank: leader.rank,
              account: leader.account,
              pnl: leader.pnl
            }"
          />
        </PartialsLeaderboardPnlCommonTableWrapper>
      </template>

      <PartialsLeaderboardTableBottomGradient
        v-if="
          filteredPnlLeaderboard.length !==
          leaderboardStore.leaderboard?.leaders.length
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
          leaderboardStore.leaderboard?.leaders.length
      "
      @limit:increment="incrementLimit"
    />
  </div>
</template>
