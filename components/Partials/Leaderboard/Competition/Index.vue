<script setup lang="ts">
import { CampaignV2 } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { LeaderboardType, LeaderboardSubPage } from '@/types'

const route = useRoute()
const campaignStore = useCampaignStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    campaign: CampaignV2
  }>(),
  {}
)

const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => fetchLeaderboard())

function fetchLeaderboard() {
  if (!props.campaign) {
    return
  }

  Promise.all([
    leaderboardStore.fetchCompetitionLeaderboard({
      type: props.campaign.type as LeaderboardType,
      account: sharedWalletStore.injectiveAddress,
      duration: {
        startDate: props.campaign.startDate,
        endDate: props.campaign.endDate
      }
    }),
    route.name === LeaderboardSubPage.PastCompetitions
      ? [
          campaignStore.fetchLeaderboardCompetitionResults(
            props.campaign.name,
            sharedWalletStore.injectiveAddress
          )
        ]
      : []
  ])
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
        <PartialsLeaderboardCompetitionMyStats v-bind="{ campaign }" />

        <PartialsLeaderboardCompetitionTable v-bind="{ campaign }" />
      </div>
    </AppHocLoading>
  </div>
</template>
