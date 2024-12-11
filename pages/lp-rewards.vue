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
  <AppHocLoading v-bind="{ status }" is-full-screen>
    <div class="mb-40">
      <NuxtPage />
    </div>
  </AppHocLoading>
</template>
