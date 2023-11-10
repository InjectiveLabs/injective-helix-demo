<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'

defineProps({
  isUpcoming: Boolean,

  market: {
    required: true,
    type: Object as PropType<UiSpotMarketWithToken>
  }
})
</script>
<template>
  <div class="w-full">
    <NuxtLink
      :to="`/auctions/${
        market.slug
      }?showAuctions=true&isUpcoming=${!!isUpcoming}`"
      class="grid grid-cols-1 md:grid-cols-2 bg-gray-900 rounded-2xl overflow-hidden w-full group"
    >
      <div class="bg-white p-4 grid place-items-center overflow-hidden">
        <img
          src="/images/talis-logo.svg"
          alt=""
          class="group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div>
        <div class="flex justify-end p-6 pb-0">
          <p
            v-if="isUpcoming"
            class="bg-orange-500 text-black py-0.5 px-1 font-bold text-xs rounded"
          >
            Upcoming
          </p>
          <p
            v-else
            class="bg-green-500 text-black py-0.5 px-1 font-bold text-xs rounded"
          >
            Live
          </p>
        </div>
        <div class="p-4 space-y-2">
          <h2 class="font-bold text-xl">TALIS</h2>
          <h4 class="text-xs uppercase text-gray-500">Tokens Offered</h4>
          <p class="text-xl">100,000 TALIS</p>
          <h4 class="text-xs uppercase text-gray-500">Starting Bid Price</h4>
          <p class="text-xl">1.00 USDT</p>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
