<script setup lang="ts">
const gridStore = useGridStore()
const walletStore = useWalletStore()

const activeStrategies = computed(() =>
  gridStore.strategies.filter(
    (strategy) =>
      strategy.state === 'active' &&
      strategy.marketId === gridStore.market?.marketId
  )
)
</script>

<template>
  <div class="overflow-x-auto h-full grid grid-rows-[auto_1fr]">
    <div class="grid grid-cols-5 uppercase">
      <div class="font-normal text-xs p-4">Time</div>

      <div class="font-normal text-xs p-4">Market</div>

      <div class="font-normal text-xs p-4">Investment</div>

      <div class="font-normal text-xs p-4">Duration</div>

      <div class="font-normal text-xs p-4">Grid Status</div>
    </div>

    <div v-if="walletStore.isUserWalletConnected" class="bg-black rounded-xl">
      <PartialsGridTradingSpotOrdersRow
        v-for="strategy in activeStrategies"
        v-bind="{ strategy }"
        :key="`strategy-${strategy.createdAt}`"
      />
    </div>

    <div v-else>
      <h1>Connect Wallet</h1>
    </div>
  </div>
</template>
