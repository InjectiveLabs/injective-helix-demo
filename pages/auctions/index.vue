<script setup lang="ts">
import { AUCTIONS } from '@/app/data/market'
</script>

<template>
  <div>
    <div class="flex flex-col items-center pt-20 space-y-6">
      <h1 class="text-4xl font-bold">Auctions</h1>
      <p class="text-lg max-w-lg text-center">
        An orderbook auction platform for new projects to raise capital and for
        the community to participate in projects on Injective.
      </p>

      <div class="max-md:w-full space-y-4">
        <PartialsAuctionsAuction
          v-for="auction in AUCTIONS"
          :key="`auction-${auction.marketId}-${auction.name}`"
          v-bind="{ auction }"
        />
      </div>

      <div>
        <PartialsAuctionsUpcomingTime class="text-center" />
      </div>
    </div>
  </div>
</template>
