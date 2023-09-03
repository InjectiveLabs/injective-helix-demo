<script setup lang="ts">
const auctionStore = useAuctionStore()

const market = computed(() => auctionStore.markets[0])
</script>

<template>
  <div>
    <div class="flex flex-col items-center pt-20 space-y-6">
      <h1 class="text-4xl font-bold">Auctions</h1>
      <p class="text-lg max-w-lg text-center">
        An orderbook auction platform for new projects to raise capital and for
        the community to participate in projects on Injective.
      </p>

      <div v-if="auctionStore.markets.length > 0" class="max-md:w-full">
        <!-- We only have two auctions for now as a mockup demo -->
        <PartialsAuctionsAuction v-bind="{ market }" />
        <PartialsAuctionsAuction
          v-bind="{ market, isUpcoming: true }"
          class="mt-6"
        />
      </div>

      <div>
        <PartialsAuctionsUpcomingTime class="text-center" />
      </div>
    </div>
  </div>
</template>
