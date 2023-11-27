<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { CAMPAIGN_LP_ROUNDS } from '@/app/data/guild'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()

const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

onMounted(() => {
  status.setLoading()

  const campaignIds = CAMPAIGN_LP_ROUNDS.reduce<string[]>(
    (campaignIds, round) => [
      ...campaignIds,
      ...round.campaigns.map((c) => c.campaignId)
    ],
    []
  )

  Promise.all([
    spotStore.init(),
    spotStore.fetchMarketsSummary(),
    tokenStore.fetchTokensUsdPriceMap(
      tokenStore.tokens.map(({ coinGeckoId }) => coinGeckoId)
    ),
    campaignStore.fetchCampaigns(campaignIds)
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppHocLoading v-bind="{ status }">
    <NuxtPage />
  </AppHocLoading>
</template>
