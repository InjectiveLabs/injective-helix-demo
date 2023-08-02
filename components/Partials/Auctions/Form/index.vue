<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})
</script>

<template>
  <div>
    <h3 class="text-2xl font-semibold">Place Bid now</h3>
    <p class="text-gray-400">Price & Bid size</p>
    <div>
      <PartialsAuctionsFormChart v-bind="{ market }" />
    </div>
    <div>
      <p class="font-bold my-2">Bid Price</p>
      <AppInputNumeric />
    </div>

    <p class="font-bold my-2">Amount</p>
    <div class="gap-4 grid grid-cols-2">
      <AppInputNumeric />
      <AppInputNumeric />
    </div>

    <div class="flex justify-between items-center py-4">
      <p>Total</p>
      <p>USDT</p>
    </div>

    <div>
      <button
        class="w-full bg-blue-400 text-white p-4 rounded-md font-semibold"
      >
        Place Bid
      </button>
    </div>
  </div>
</template>
