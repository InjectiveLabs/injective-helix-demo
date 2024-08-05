<script lang="ts" setup>
import { LeaderboardType } from '@/types'

const campaignStore = useCampaignStore()
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
    <PartialsLeaderboardCompetitionCommonTableWrapper
      class="text-gray-350 text-[11px]"
    >
      <PartialsLeaderboardCompetitionCommonHeader />
    </PartialsLeaderboardCompetitionCommonTableWrapper>

    <div v-if="filteredVolumeLeaderboard.length > 0" class="relative">
      <template v-for="leader in filteredVolumeLeaderboard" :key="leader.rank">
        <PartialsLeaderboardCompetitionCommonTableWrapper
          class="text-sm my-1 items-center rounded-lg"
          :class="{
            'bg-gray-825 py-4 text-white': leader.rank > 1,
            'bg-[#F3C211] py-5 text-gray-1100': leader.rank === 1
          }"
        >
          <PartialsLeaderboardCompetitionCommonRow
            v-bind="{
              rank: leader.rank,
              amount:
                campaignStore.activeCampaignType === LeaderboardType.Pnl
                  ? leader.pnl
                  : leader.volume,
              account: leader.account
            }"
          />
        </PartialsLeaderboardCompetitionCommonTableWrapper>
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
        message: $t('leaderboard.competition.noVolumeData')
      }"
    />

    <PartialsLeaderboardViewMore
      v-if="
        filteredVolumeLeaderboard.length > 0 &&
        filteredVolumeLeaderboard.length !==
          leaderboardStore.leaderboard?.leaders.length
      "
      @limit:increment="incrementLimit"
    />
  </div>
</template>
