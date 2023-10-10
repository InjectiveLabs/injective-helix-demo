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

const auctionTime = computed(() =>
  format(props.auction.auctionCloses, 'MMM dd, yyyy HH:mm')
)
</script>

<template>
  <div class="flex flex-col md:flex-row gap-4">
    <div class="basis-64">
      <div
        class="bg-white rounded-2xl p-4 max-w-md mx-auto overflow-hidden group"
      >
        <img
          :src="auction.logo"
          alt=""
          class="aspect-square w-full object-contain group-hover:scale-110 transition-transform duration-300"
        />
      </div>
    </div>
    <div class="flex-1 p-4 space-y-4">
      <div class="flex items-center space-x-4">
        <img
          :src="auction.logo"
          alt=""
          class="aspect-square w-12 object-contain bg-white rounded-full p-1"
        />
        <h3 class="text-4xl font-bold uppercase">{{ auction.name }}</h3>
        <p
          class="font-bold text-sm py-0.5 px-2 rounded-md text-black"
          :class="[isLive ? 'bg-green-500' : 'bg-orange-500']"
        >
          {{ isLive ? 'LIVE' : 'UPCOMING' }}
        </p>
      </div>

      <p class="max-w-md">
        {{ auction.headerDescription }}
      </p>

      <div class="flex gap-8">
        <div>
          <h3 class="text-gray-400 uppercase font-semibold">Tokens Offered</h3>
          <p class="uppercase">
            {{ tokensOfferedToString }} {{ auction.name }}
          </p>
        </div>
        <div>
          <h3 class="text-gray-400 uppercase font-semibold">Auction Time</h3>
          <p>{{ auctionTime }} UTC</p>
        </div>
      </div>
    </div>
  </div>
</template>
