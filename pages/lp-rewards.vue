<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()

const { $onError } = useNuxtApp()

const round = useQueryRef('round', '')
const status = reactive(new Status(StatusType.Idle))

onMounted(() => {
  status.setLoading()

  const roundId = round.value ? Number(round.value) : undefined

  Promise.all([
    spotStore.init(),
    spotStore.fetchMarketsSummary(),
    tokenStore.getTokensUsdPriceMapFromToken(tokenStore.tokens),
    campaignStore.fetchRound(roundId)
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
