<script lang="ts" setup>
const campaignStore = useCampaignStore()

const limit = ref(20)

const filteredPnlLeaderboard = computed(() =>
  campaignStore.leaderboard.leaders.slice(0, limit.value)
)

function incrementLimit() {
  const LIMIT_INCREMENT_AMOUNT = 20

  limit.value += LIMIT_INCREMENT_AMOUNT
}
</script>

<template>
  <div class="mb-20">
    <PartialsLeaderboardPnlTableWrapper class="text-xs text-gray-500">
      <PartialsLeaderboardPnlHeader />
    </PartialsLeaderboardPnlTableWrapper>

    <div class="relative">
      <template v-for="leader in filteredPnlLeaderboard" :key="leader.rank">
        <PartialsLeaderboardPnlTableWrapper
          class="text-sm my-1 items-center rounded-lg"
          :class="{
            'bg-gray-825 py-4 text-white': leader.rank > 3,
            'bg-[#F3C211] py-5 text-gray-1100': leader.rank === 1,
            'bg-[#AAAAAA] py-5 text-gray-1100': leader.rank === 2,
            'bg-[#BD7B31] py-5 text-gray-1100': leader.rank === 3
          }"
        >
          <PartialsLeaderboardPnlRow
            v-bind="{
              rank: leader.rank,
              account: leader.account,
              pnl: leader.pnl
            }"
          />
        </PartialsLeaderboardPnlTableWrapper>
      </template>

      <PartialsLeaderboardTableBottomGradient
        v-if="
          filteredPnlLeaderboard.length !==
          campaignStore.leaderboard.leaders.length
        "
      />
    </div>

    <PartialsLeaderboardViewMore
      v-if="
        filteredPnlLeaderboard.length !==
        campaignStore.leaderboard.leaders.length
      "
      @limit:increment="incrementLimit"
    />
  </div>
</template>
