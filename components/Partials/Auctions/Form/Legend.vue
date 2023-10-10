<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'

const props = defineProps({
  currentProjectedPrice: {
    type: Number,
    required: true
  }
})

const spotStore = useSpotStore()

const isCurrentBidLowerThanProjectedPrice = computed(() => {
  if (spotStore.subaccountOrders.length > 0) {
    return new BigNumberInBase(
      [...spotStore.subaccountOrders].sort((a, b) => {
        return Number(a.price) - Number(b.price)
      })[0].price
    ).lte(props.currentProjectedPrice)
  }
  return false
})
</script>

<template>
  <div v-if="isCurrentBidLowerThanProjectedPrice">
    <div class="flex items-center space-x-2 mb-4">
      <div class="w-3 h-3 bg-white rounded-full" />
      <p>Projected Price</p>
      <AppTooltip
        content="Projected Price is the lowest bid that guarantees you will receive a token, if the auction were to end now.
 It is calculated based on the current bids and the total
 number of tokens available. However, other bidders can still outbid you."
      />
    </div>

    <div class="text-[#F3A400] mb-4">
      <p>
        <span class="font-semibold">Warning:</span> Your lowest bid price is
        below the Projected Price.
      </p>
    </div>
  </div>
</template>
