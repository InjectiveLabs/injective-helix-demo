<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const spotStore = useSpotStore()
const campaignStore = useCampaignStore()
const gridStrategyStore = useGridStrategyStore()

const { $onError } = useNuxtApp()

const round = useQueryRef('round', '')

const status = reactive(new Status(StatusType.Idle))

onWalletConnected(() => {
  status.setLoading()

  const roundId = round.value ? Number(round.value) : undefined

  Promise.all([
    spotStore.init(),
    spotStore.fetchMarketsSummary(),
    campaignStore.fetchRound(roundId),
    gridStrategyStore.fetchAllStrategies()
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
