<template>
  <thead class="text-right">
    <tr class="text-xs text-coolGray-400 uppercase">
      <th class="text-left">{{ $t('campaign.market') }}</th>
      <th class="text-left">{{ $t('campaign.rewards') }}</th>
      <th>{{ $t('campaign.activeBots') }}</th>
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
