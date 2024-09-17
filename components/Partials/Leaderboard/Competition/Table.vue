<script lang="ts" setup>
const leaderboardStore = useLeaderboardStore()

const limit = ref(20)

const filteredVolumeLeaderboard = computed(() => {
  if (!leaderboardStore.competitionLeaderboard?.leaders) {
    return []
  }

  return leaderboardStore.competitionLeaderboard.leaders.slice(0, limit.value)
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

    <div v-if="filteredVolumeLeaderboard.length > 0" class="relative">
      <PartialsLeaderboardCompetitionCommonRow
        v-for="leader in filteredVolumeLeaderboard"
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
          filteredVolumeLeaderboard.length !==
          leaderboardStore.competitionLeaderboard?.leaders.length
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
        filteredVolumeLeaderboard.length > 0 &&
        filteredVolumeLeaderboard.length !==
          leaderboardStore.competitionLeaderboard?.leaders.length
      "
      @limit:increment="incrementLimit"
    />
  </div>
</template>
