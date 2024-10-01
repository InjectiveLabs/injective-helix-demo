<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import * as WalletTracker from '@/app/providers/mixpanel/WalletTracker'
import { UnknownTokenStatusKey } from '@/types'

const route = useRoute()
const appStore = useAppStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const sharedGeoStore = useSharedGeoStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()
const { addTokensToPriceWatchList } = useTokenUsdPrice()

const status = reactive(new Status(StatusType.Loading))
const unknownTokenStatus = reactive(new Status(StatusType.Loading))

onMounted(() => {
  const queryMarketId = route.query.marketId as string | undefined

  // coinGeckoIds only exist on verified tokens (manually added tokens to injective-list)
  addTokensToPriceWatchList(tokenStore.verifiedTokens)

  tokenStore.fetchUntrackedTokens().finally(() => unknownTokenStatus.setIdle())

  Promise.all([
    walletStore.init(),
    sharedGeoStore.fetchGeoLocation(),
    spotStore.initFromTradingPage(queryMarketId),
    derivativeStore.initFromTradingPage(queryMarketId)
  ])
    .catch($onError)
    .then(() => {
      if (sharedWalletStore.isUserConnected) {
        WalletTracker.trackWalletAddress(sharedWalletStore.injectiveAddress)
      }
    })
    .finally(() => status.setIdle())

  // Actions that should't block the app from loading
  Promise.all([appStore.fetchBlockHeight()])
})

onWalletInitialConnected(() => {
  WalletTracker.trackLogin({
    wallet: sharedWalletStore.wallet,
    address: sharedWalletStore.injectiveAddress
  })
})

provide(UnknownTokenStatusKey, unknownTokenStatus)
</script>

<template>
  <AppHocLoading is-helix wrapper-class="h-screen" :status="status">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </AppHocLoading>
</template>
