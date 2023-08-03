<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})
const walletStore = useWalletStore()
</script>

<template>
  <div>
    <PartialsAuctionsMyBids
      v-if="walletStore.isUserWalletConnected"
      v-bind="{ market }"
    />
    <div v-else>Connect Wallet</div>
  </div>
</template>
