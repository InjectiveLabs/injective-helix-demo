<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const spotStore = useSpotStore()
</script>

<template>
  <div>
    <div>
      <h1 class="text-3xl font-semibold mb-10">Bids</h1>
    </div>
    <div v-if="spotStore.orderbook" class="overflow-auto max-h-lg">
      <table class="min-w-max w-full">
        <thead class="text-gray-400 text-sm">
          <th class="py-2 text-left">Offer Price USDT</th>
          <th class="text-right pr-2">Amount</th>
          <th class="text-right pr-2">Total USDT</th>
        </thead>
        <tbody>
          <PartialsAuctionsBidsRow
            v-for="({ price, quantity }, index) in spotStore.orderbook.buys"
            :key="`bid-${index}-${quantity}-${price}`"
            v-bind="{ price, quantity, market }"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
