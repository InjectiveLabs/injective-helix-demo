<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})
const walletStore = useWalletStore()
watch(
  () => walletStore.isUserWalletConnected,
  (isConnected) => {
    if (!isConnected) {
      navigateTo('/auctions/talis/?showAuctions=true')
    }
  }
)
</script>

<template>
  <div>
    <PartialsAuctionsMyBids
      v-if="walletStore.isUserWalletConnected"
      v-bind="{ market }"
    />
    <div v-else class="text-center">Please Connect Wallet</div>
  </div>
</template>
