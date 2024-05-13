<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const route = useRoute()
const appStore = useAppStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const { addTokensToPriceWatchList } = useTokenUsdPrice()

const status = reactive(new Status(StatusType.Loading))

onMounted(async () => {
  const queryMarketId = route.query.marketId as string | undefined

  // coinGeckoIds only exist on verified tokens (manually added tokens to injective-list)
  addTokensToPriceWatchList(tokenStore.verifiedTokens)

  await tokenStore.fetchUntrackedTokens()

  Promise.all([
    walletStore.init(),
    spotStore.initFromTradingPage(queryMarketId),
    derivativeStore.initFromTradingPage(queryMarketId)
  ])
    .catch($onError)
    .finally(() => status.setIdle())

  // Actions that should't block the app from loading
  Promise.all([appStore.init(), appStore.fetchBlockHeight()])
})
</script>

<template>
  <AppHocLoading is-helix wrapper-class="h-screen" :status="status">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </AppHocLoading>
</template>
