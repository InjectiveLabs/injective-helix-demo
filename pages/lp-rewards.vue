<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

onMounted(() => {
  status.setLoading()

  Promise.all([
    spotStore.init(),
    spotStore.fetchMarketsSummary(),
    tokenStore.fetchTokensUsdPriceMap(
      tokenStore.tokens.map(({ coinGeckoId }) => coinGeckoId)
    )
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
