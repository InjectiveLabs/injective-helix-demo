<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const spotStore = useSpotStore()

const orderHistoryFiltered = computed(() =>
  spotStore.subaccountOrderHistory.filter(
    (order) => order.marketId === props.market.marketId
  )
)
</script>

<template>
  <div class="grid grid-cols-1">
    <h3 class="text-3xl font-semibold mb-10">My Bids</h3>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead
          class="text-gray-400 text-xs tracking-wider font-semibold uppercase"
        >
          <th class="pr-2 text-left py-4">Time</th>
          <th class="px-2 text-left">Offer Price</th>
          <th class="px-2 text-right">Amount</th>
          <th class="px-2 text-right">Total</th>
          <th class="px-2 text-right">Status</th>
        </thead>
        <tbody>
          <PartialsAuctionsMyBidsRow
            v-for="order in orderHistoryFiltered"
            :key="`order-${order.orderHash}`"
            v-bind="{ order, market }"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
