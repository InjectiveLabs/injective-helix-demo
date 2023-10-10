<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Auction } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  },

  auction: {
    type: Object as PropType<Auction>,
    required: true
  }
})

const walletStore = useWalletStore()

watch(
  () => walletStore.isUserWalletConnected,
  (isConnected) => {
    if (!isConnected) {
      navigateTo(`/auctions/${props.market.slug}/`)
    }
  }
)
</script>

<template>
  <div>
    <PartialsAuctionsMyBids
      v-if="walletStore.isUserWalletConnected"
      v-bind="{ market, auction }"
    />
    <div v-else class="text-center">Please Connect Your Wallet</div>
  </div>
</template>
