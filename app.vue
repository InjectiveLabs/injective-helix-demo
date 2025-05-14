<script setup lang="ts">
import { WalletConnectStatus } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { streamProvider } from '@/app/providers/StreamProvider'
import * as WalletTracker from '@/app/providers/mixpanel/WalletTracker'
import { InitialStatusKey } from '@/types'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const sharedGeoStore = useSharedGeoStore()
const isActiveTab = useDocumentVisibility()
const sharedSpotStore = useSharedSpotStore()
const sharedTokenStore = useSharedTokenStore()
const sharedWalletStore = useSharedWalletStore()
const sharedDerivativeStore = useSharedDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const unknownTokenStatus = reactive(new Status(StatusType.Loading))

onMounted(async () => {
  handleGoogleOAuth()
  sharedTokenStore.fetchSupply().finally(() => unknownTokenStatus.setIdle())

  Promise.all([
    walletStore.init(),
    sharedSpotStore.fetchMarkets(),
    sharedGeoStore.fetchGeoLocation(),
    sharedDerivativeStore.fetchMarkets(),
    sharedTokenStore.fetchTokensUsdPriceMap()
  ])
    .catch($onError)
    .then(() => {
      if (sharedWalletStore.isUserConnected) {
        WalletTracker.trackWalletAddress(sharedWalletStore.injectiveAddress)
      }
    })
    .finally(() => {
      status.setIdle()
    })
})

onWalletInitialConnected(() => {
  WalletTracker.trackLogin({
    wallet: sharedWalletStore.wallet,
    address: sharedWalletStore.injectiveAddress
  })
})

function handleGoogleOAuth() {
  if (sharedWalletStore.isUserConnected) {
    return
  }

  if (!route.hash) {
    return
  }

  const params = new URLSearchParams(route.hash.substring(1))
  const idToken = params.get('id_token')

  if (!idToken) {
    return
  }

  router.replace({ hash: '' })

  sharedWalletStore
    .initTurnkeyGoogle(idToken)
    .catch($onError)
    .finally(() => {
      sharedWalletStore.walletConnectStatus = WalletConnectStatus.idle
    })
}

provide(InitialStatusKey, status)

useIntervalFn(
  () =>
    Promise.all([
      streamProvider.healthCheck(),
      sharedTokenStore.fetchTokensUsdPriceMap()
    ]),
  30 * 1000
)
watch(isActiveTab, (isActive) => {
  if (!isActive) {
    return
  }

  streamProvider.healthCheck()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
