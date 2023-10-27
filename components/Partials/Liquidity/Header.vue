<script setup lang="ts">
//
</script>

<template>
  <div class="flex mt-8">
    <div class="flex-1">
      <div class="pb-4">
        <h2 class="text-3xl font-bold">
          {{ $t('campaign.liquidityBotRewards') }}
        </h2>
        <p>{{ $t('campaign.getRewarded') }}</p>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[auto_auto_auto] gap-2 mt-4"
      >
        <div>
          <p class="text-gray-600 text-sm mb-2">
            {{ $t('campaign.totalRewards') }}
          </p>
          <h2 class="text-2xl font-semibold">10,000 INJ + 10,000 TIA</h2>
        </div>
        <div>
          <p class="text-gray-600 text-sm mb-2">
            {{ $t('campaign.eligibleMarkets') }}
          </p>
          <h2 class="text-2xl font-semibold">INJ/USDT</h2>
        </div>
        <div>
          <p class="text-gray-600 text-sm mb-2">
            {{ $t('campaign.endTime') }}
          </p>
          <h2 class="text-2xl font-semibold">Nov 14,2023</h2>
        </div>
      </div>
    </div>

    <div class="hidden sm:block pl-4">
      <img src="/svg/leaderboard_graphic.svg" />
    </div>
  </div>
</template>
