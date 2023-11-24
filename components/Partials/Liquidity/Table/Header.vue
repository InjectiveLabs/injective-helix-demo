<script setup lang="ts">
//
</script>

<template>
  <thead class="text-right">
    <tr class="text-xs text-gray-400 uppercase">
      <th class="text-left">{{ $t('campaign.market') }}</th>
      <th class="text-left">{{ $t('campaign.rewards') }}</th>
      <th v-if="false">
        <span>
          {{ $t('campaign.rewardYield') }}
        </span>
      </th>
      <th v-if="false">
        <span>
          {{ $t('campaign.liquidity') }}
        </span>
      </th>
      <th>{{ $t('campaign.volume') }}</th>
      <th></th>
    </tr>
  </thead>
</template>

<style scoped>
th {
  @apply p-2 font-normal;
}
</style>
