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
    <div v-else class="text-center">Please Connect Wallet Connect Wallet</div>
  </div>
</template>
