<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { tokensStatusKey } from './types'

const appStore = useAppStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const tokenStatus = reactive(new Status(StatusType.Loading))

onMounted(() => {
  Promise.all([
    walletStore.init(),
    tokenStore.fetchTokens(),
    spotStore.initIfNotInit(),
    derivativeStore.initIfNotInit(),
    derivativeStore.fetchMarketsSummary(),
    spotStore.fetchMarketsSummary()
  ])
    .then(() => {
      tokenStatus.setLoading()
      tokenStore
        .getTokensUsdPriceMapFromToken(tokenStore.tokens)
        .then(() => {
          tokenStatus.setIdle()
        })
        .catch($onError)
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })

  // Actions that should't block the app from loading
  Promise.all([appStore.init(), appStore.fetchBlockHeight()])
})

provide(tokensStatusKey, tokenStatus)

useIntervalFn(() => {
  tokenStore.getTokensUsdPriceMapFromToken(tokenStore.tokens)
}, 1000 * 60)
</script>

<template>
  <AppHocLoading is-helix wrapper-class="h-screen" :status="status">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </AppHocLoading>
</template>
