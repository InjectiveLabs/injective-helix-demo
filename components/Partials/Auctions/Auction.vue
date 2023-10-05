<script lang="ts" setup>
import { PropType } from 'vue'
import { Auction } from '@/types'

const props = defineProps({
  auction: {
    type: Object as PropType<Auction>,
    required: true
  }
})

const auctionStore = useAuctionStore()

const now = ref(Date.now())

const market = computed(() =>
  auctionStore.markets.find(
    (market) => market.marketId === props.auction.marketId
  )
)

const isLive = computed(
  () =>
    props.auction.auctionStarts.getTime() < now.value &&
    props.auction.auctionCloses.getTime() > now.value
)

const { valueToString: tokensOfferedToString } = useBigNumberFormatter(
  computed(() => props.auction.tokensOffered),
  { decimalPlaces: 0 }
)

const { valueToString: startingBidPriceToString } = useBigNumberFormatter(
  computed(() => props.auction.startingBidPrice),
  { decimalPlaces: 2 }
)
</script>
<template>
  <div v-if="market" class="w-full">
    <NuxtLink
      :to="`/auctions/${market.slug}`"
      class="grid grid-cols-1 md:grid-cols-2 bg-gray-900 rounded-2xl overflow-hidden w-full group"
    >
      <div class="bg-white p-4 grid place-items-center overflow-hidden">
        <img
          :src="auction.logo"
          alt=""
          class="group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div>
        <div class="flex justify-end p-6 pb-0">
          <p
            v-if="isLive"
            class="bg-green-500 text-black py-0.5 px-1 font-bold text-xs rounded"
          >
            Live
          </p>
          <p
            v-else
            class="bg-orange-500 text-black py-0.5 px-1 font-bold text-xs rounded"
          >
            Upcoming
          </p>
        </div>
        <div class="p-4 space-y-2">
          <h2 class="font-bold text-xl uppercase">{{ auction.name }}</h2>
          <h4 class="text-xs uppercase text-gray-500">Tokens Offered</h4>
          <p class="text-xl uppercase">
            {{ tokensOfferedToString }} {{ auction.name }}
          </p>
          <h4 class="text-xs uppercase text-gray-500">Starting Bid Price</h4>
          <p class="text-xl">{{ startingBidPriceToString }} USDT</p>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
