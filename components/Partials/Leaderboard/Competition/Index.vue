<script setup lang="ts">
import { CampaignV2 } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { CAMPAIGNS_WITH_ANNOUNCED_WINNERS } from '@/app/data/campaign'
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

onWalletConnected(fetchLeaderboard)

function fetchLeaderboard() {
  if (!props.campaign) {
    return
  }

  const promises = [
    leaderboardStore.fetchCompetitionLeaderboard({
      type: props.campaign.type as LeaderboardType,
      account: sharedWalletStore.injectiveAddress,
      duration: {
        startDate: props.campaign.startDate,
        endDate: props.campaign.endDate
      }
    })
  ]

  if (
    CAMPAIGNS_WITH_ANNOUNCED_WINNERS.includes(props.campaign.name) &&
    route.name === LeaderboardSubPage.PastCompetitions
  ) {
    promises.push(
      campaignStore.fetchLeaderboardCompetitionResults(
        props.campaign.name,
        sharedWalletStore.injectiveAddress
      )
    )
  }

  Promise.all(promises)
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
