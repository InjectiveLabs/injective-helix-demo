<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const campaignStore = useCampaignStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  fetchLeaderboard()
})

function fetchLeaderboard() {
  if (!campaignStore.activeCampaign || !campaignStore.activeCampaignType) {
    return
  }

  leaderboardStore
    .fetchCompetitionLeaderboard({
      type: campaignStore.activeCampaignType,
      account: sharedWalletStore.injectiveAddress,
      duration: {
        startDate: campaignStore.activeCampaign.startDate,
        endDate: campaignStore.activeCampaign.endDate
      }
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div>
    <AppHocLoading v-bind="{ status }">
      <div>
        <PartialsLeaderboardCompetitionMyStats />

        <PartialsLeaderboardCompetitionTable />
      </div>
    </AppHocLoading>
  </div>
</template>
