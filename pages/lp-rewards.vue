<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { LP_CAMPAIGNS } from '@/app/data/campaign'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()

const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

onMounted(() => {
  status.setLoading()

  const campaignIds = LP_CAMPAIGNS.map(({ campaignId }) => campaignId)

  Promise.all([
    spotStore.init(),
    spotStore.fetchMarketsSummary(),
    tokenStore.getTokensUsdPriceMapFromToken(tokenStore.tokens),
    campaignStore.fetchCampaignsWithSc({ campaignIds })
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <div class="mb-40">
    <AppHocLoading v-bind="{ status }">
      <NuxtPage />
    </AppHocLoading>
  </div>
</template>
