<script setup lang="ts">
import { format } from 'date-fns'
import { Auction } from '@/types'

const props = defineProps({
  isLive: Boolean,

  auction: {
    type: Object as PropType<Auction>,
    required: true
  }
})

const { valueToString: tokensOfferedToString } = useBigNumberFormatter(
  computed(() => props.auction.tokensOffered),
  { decimalPlaces: 0 }
)

const { valueToString: startingBidPriceToString } = useBigNumberFormatter(
  computed(() => props.auction.startingBidPrice),
  { decimalPlaces: 2 }
)

const auctionStartsFormatted = computed(() =>
  format(props.auction.auctionStarts, 'MMM dd, yyyy HH:mm')
)

const auctionClosesFormatted = computed(() =>
  format(props.auction.auctionCloses, 'MMM dd, yyyy HH:mm')
)
</script>

<template>
  <div>
    <h3 class="text-3xl font-semibold mb-8">Project details</h3>

    <p>
      {{ auction.description }}
    </p>

    <div class="py-4 flex flex-wrap gap-2">
      <NuxtLink
        :to="auction.website"
        target="_blank"
        class="bg-blue-800 text-blue-500 px-2 py-0.5 rounded-md font-semibold text-sm"
      >
        Website
      </NuxtLink>

      <NuxtLink
        :to="auction.twitter"
        class="bg-blue-800 text-blue-500 px-2 py-0.5 rounded-md font-semibold text-sm"
      >
        Twitter
      </NuxtLink>

      <NuxtLink
        :to="auction.tokenAddress"
        class="bg-blue-800 text-blue-500 px-2 py-0.5 rounded-md font-semibold text-sm"
      >
        Token Address
      </NuxtLink>
    </div>

    <div>
      <h3 class="text-gray-400 font-semibold py-4">AUCTION INFO</h3>

      <div
        class="flex justify-between items-center py-4 border-y border-y-gray-600"
      >
        <p>Tokens Offered</p>
        <p class="uppercase">{{ tokensOfferedToString }} {{ auction.name }}</p>
      </div>

      <div
        class="flex justify-between items-center py-4 border-y border-y-gray-600"
      >
        <p>Starting bid price</p>
        <p>{{ startingBidPriceToString }} USDT</p>
      </div>

      <div
        class="flex justify-between items-center py-4 border-y border-y-gray-600"
      >
        <p>Auction Starts</p>
        <p>{{ auctionStartsFormatted }} UTC</p>
      </div>

      <div
        class="flex justify-between items-center py-4 border-y border-y-gray-600"
      >
        <p>Auction Ends</p>
        <p>{{ auctionClosesFormatted }} UTC</p>
      </div>

      <div
        class="flex justify-between items-center py-4 border-y border-y-gray-600"
      >
        <p>Total amount raised (Projected)</p>
        <p>10,100,200 USDT</p>
      </div>
    </div>
  </div>
</template>
