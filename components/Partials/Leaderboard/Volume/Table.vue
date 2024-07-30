<script lang="ts" setup>
const leaderboardStore = useLeaderboardStore()

const limit = ref(20)

const filteredVolumeLeaderboard = computed(() => {
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
    <PartialsLeaderboardVolumeCommonTableWrapper
      class="text-gray-350 text-[11px]"
    >
      <PartialsLeaderboardVolumeCommonHeader />
    </PartialsLeaderboardVolumeCommonTableWrapper>

    <div v-if="filteredVolumeLeaderboard.length > 0" class="relative">
      <template v-for="leader in filteredVolumeLeaderboard" :key="leader.rank">
        <PartialsLeaderboardVolumeCommonTableWrapper
          class="text-sm my-1 items-center rounded-lg"
          :class="{
            'bg-gray-825 py-4 text-white': leader.rank > 1,
            'bg-[#F3C211] py-5 text-gray-1100': leader.rank === 1
          }"
        >
          <PartialsLeaderboardVolumeCommonRow
            v-bind="{
              rank: leader.rank,
              volume: leader.volume,
              account: leader.account
            }"
          />
        </PartialsLeaderboardVolumeCommonTableWrapper>
      </template>

      <PartialsLeaderboardTableBottomGradient
        v-if="
          filteredVolumeLeaderboard.length !==
          leaderboardStore.leaderboard?.leaders.length
        "
      />
    </div>

    <CommonEmptyList
      v-else
      v-bind="{
        message: $t('leaderboard.volume.noVolumeData')
      }"
    />

    <PartialsLeaderboardViewMore
      v-if="
        filteredVolumeLeaderboard.length !==
        leaderboardStore.leaderboard?.leaders.length
      "
      @limit:increment="incrementLimit"
    />
  </div>
</template>
