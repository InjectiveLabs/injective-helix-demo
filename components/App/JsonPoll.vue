<script setup lang="ts">
import { JSON_POLL_INTERVAL } from '@shared/utils/constant'
import {
  swapRoutes,
  verifiedDenoms,
  spotGridMarkets,
  expiryMarketIdMap,
  marketCategoriesMap,
  derivativeGridMarkets,
  verifiedSpotMarketIdMap,
  verifiedDerivateMarketIdMap
} from '@/app/json'

const jsonStore = useSharedJsonStore()

const emit = defineEmits<{
  'on:loaded': []
}>()

onMounted(() => {
  mountCachedJson()
  pollJson().finally(() => {
    emit('on:loaded')
  })
})

function mountCachedJson() {
  jsonStore.swapRoutes = swapRoutes
  jsonStore.verifiedDenoms = verifiedDenoms
  jsonStore.spotGridMarkets = spotGridMarkets
  jsonStore.expiryMarketMap = expiryMarketIdMap
  jsonStore.helixMarketCategory = marketCategoriesMap
  jsonStore.derivativeGridMarkets = derivativeGridMarkets
  jsonStore.verifiedSpotMarketMap = verifiedSpotMarketIdMap
  jsonStore.verifiedDerivativeMarketMap = verifiedDerivateMarketIdMap
}

function pollJson() {
  return Promise.all([
    jsonStore.fetchToken(),
    jsonStore.fetchSwapRoutes(),
    jsonStore.fetchSpotGridMarkets(),
    jsonStore.fetchExpiryMarketMap(),
    jsonStore.fetchMarketCategoryMap(),
    jsonStore.fetchVerifiedSpotMarketMap(),
    jsonStore.fetchDerivativeGridMarkets(),
    jsonStore.fetchVerifiedDerivativeMarketMap()
  ])
}

useIntervalFn(pollJson, JSON_POLL_INTERVAL)
</script>

<template>
  <div />
</template>
