<script setup lang="ts">
import { JSON_POLL_INTERVAL } from '@shared/utils/constant'
import {
  swapRoutes,
  verifiedDenoms,
  spotGridMarkets,
  expiryMarketIdMap,
  marketCategoriesMap,
  restrictedCountries,
  blacklistedAddresses,
  derivativeGridMarkets,
  verifiedSpotMarketIdMap,
  verifiedDerivateMarketIdMap
} from '@/app/json'

const jsonStore = useSharedJsonStore()
const sharedWalletStore = useSharedWalletStore()

const emit = defineEmits<{
  'on:loaded': []
}>()

onMounted(() => {
  mountCachedJson()
  pollJson().finally(() => {
    emit('on:loaded')
  })
})

function pollJson() {
  return Promise.all([
    jsonStore.fetchToken(),
    jsonStore.fetchSwapRoutes(),
    jsonStore.fetchSpotGridMarkets(),
    jsonStore.fetchExpiryMarketMap(),
    jsonStore.fetchChainUpgradeConfig(),
    jsonStore.fetchMarketCategoryMap(),
    jsonStore.fetchRestrictedCountries(),
    jsonStore.fetchBlacklistedAddresses(),
    jsonStore.fetchVerifiedSpotMarketMap(),
    jsonStore.fetchDerivativeGridMarkets(),
    sharedWalletStore.fetchWeb3GatewayStatus(),
    jsonStore.fetchVerifiedDerivativeMarketMap()
  ])
}

function mountCachedJson() {
  jsonStore.fetchFullTokenList()

  jsonStore.swapRoutes = swapRoutes.map((route) => ({
    ...route,
    sourceDenom: route.source_denom,
    targetDenom: route.target_denom
  }))

  jsonStore.verifiedDenoms = verifiedDenoms
  jsonStore.spotGridMarkets = spotGridMarkets
  jsonStore.expiryMarketMap = expiryMarketIdMap
  jsonStore.restrictedCountries = restrictedCountries
  jsonStore.helixMarketCategory = marketCategoriesMap
  jsonStore.blacklistedAddresses = blacklistedAddresses
  jsonStore.derivativeGridMarkets = derivativeGridMarkets
  jsonStore.verifiedSpotMarketMap = verifiedSpotMarketIdMap
  jsonStore.verifiedDerivativeMarketMap = verifiedDerivateMarketIdMap
}

useIntervalFn(pollJson, JSON_POLL_INTERVAL) // 10 mins
</script>

<template>
  <div />
</template>
