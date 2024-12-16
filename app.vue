<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import * as WalletTracker from '@/app/providers/mixpanel/WalletTracker'
import { InitialStatusKey } from '@/types'

useHead({
  bodyAttrs: {
    class: 'dark:bg-brand-900'
  }
})

// const appStore = useAppStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const derivativeStore = useDerivativeStore()
const sharedGeoStore = useSharedGeoStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const unknownTokenStatus = reactive(new Status(StatusType.Loading))

onMounted(() => {
  tokenStore.fetchUntrackedTokens().finally(() => unknownTokenStatus.setIdle())

  Promise.all([
    walletStore.init(),
    spotStore.fetchMarkets(),
    derivativeStore.fetchMarkets(),
    sharedGeoStore.fetchGeoLocation(),
    tokenStore.fetchTokensUsdPriceMap()
  ])
    .catch($onError)
    .then(() => {
      if (sharedWalletStore.isUserConnected) {
        WalletTracker.trackWalletAddress(sharedWalletStore.injectiveAddress)
      }
    })
    .finally(() => status.setIdle())

  // Actions that should't block the app from loading
  // Promise.all([appStore.fetchBlockHeight()])
})

onWalletInitialConnected(() => {
  WalletTracker.trackLogin({
    wallet: sharedWalletStore.wallet,
    address: sharedWalletStore.injectiveAddress
  })
})

/**
 * Post only mode modal when we do chain upgrade
watch(
  () => appStore.blockHeight,
  () => {
    if (
      appStore.blockHeight >= MAINNET_UPGRADE_BLOCK_HEIGHT &&
      appStore.blockHeight <=
        MAINNET_UPGRADE_BLOCK_HEIGHT + POST_ONLY_MODE_BLOCK_THRESHOLD
    ) {
      modalStore.openModal(Modal.PostOnlyMode)
    }
  }
)
 */

provide(InitialStatusKey, status)

useIntervalFn(
  () => Promise.all([tokenStore.fetchTokensUsdPriceMap()]),
  30 * 1000
)
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
